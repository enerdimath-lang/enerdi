import "server-only";
import {
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { cache } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { dbConfigured, query } from "./db";

/**
 * Admin sign-in.
 *
 * Passwords are stored as scrypt hashes. A signed-in admin holds a cookie
 * that carries their id and an expiry, signed with SESSION_SECRET together
 * with their current password hash and a per-admin counter. Changing the
 * password or signing out therefore ends every session of that admin, on
 * every device, and a copied cookie stops working with them.
 */

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keyLength: number,
) => Promise<Buffer>;

const COOKIE = "enerdi_admin";
const SESSION_DAYS = 7;

export type Role = "owner" | "admin";
export type Admin = { id: number; email: string; name: string; role: Role };
type AdminRow = Admin & { password_hash: string; disabled: boolean; session_epoch: number };

const ADMIN_COLUMNS = "id, email, name, role, password_hash, disabled, session_epoch";

function setting(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

/** What is still missing from `.env.local` before anyone can sign in. */
export function setupProblem(): string | null {
  if (!dbConfigured()) {
    return "The database is not connected yet. Add the PostgreSQL settings to .env.local and restart the site.";
  }
  const secret = setting("SESSION_SECRET");
  if (!secret || secret.length < 32) {
    return "SESSION_SECRET is missing from .env.local (it needs at least 32 characters).";
  }
  return null;
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = await scrypt(
    password,
    Buffer.from(salt, "base64url"),
    expected.length,
  );
  return timingSafeEqual(actual, expected);
}

type Signable = { id: number; password_hash: string; session_epoch: number };

function sign(admin: Signable, expires: number) {
  const secret = setting("SESSION_SECRET") ?? "";
  return createHmac("sha256", secret)
    .update(`${admin.id}.${expires}.${admin.session_epoch}.${admin.password_hash}`)
    .digest("base64url");
}

/**
 * Creates the first admin from ADMIN_EMAIL and ADMIN_PASSWORD, but only while
 * there are no admins at all. After that, the password lives in the database
 * and is changed from the Account page.
 */
async function createFirstAdmin() {
  const email = setting("ADMIN_EMAIL")?.toLowerCase();
  const password = setting("ADMIN_PASSWORD");
  if (!email || !password) return;

  const existing = await query("SELECT 1 FROM admin_users LIMIT 1");
  if (existing.length > 0) return;

  await query(
    `INSERT INTO admin_users (email, name, password_hash, role)
     VALUES ($1, $2, $3, 'owner') ON CONFLICT (email) DO NOTHING`,
    [email, "Admin", await hashPassword(password)],
  );
}

/** Checks an email and password. Returns the admin, or null if they do not match. */
export async function checkCredentials(email: string, password: string) {
  await createFirstAdmin();
  const [row] = await query<AdminRow>(
    `SELECT ${ADMIN_COLUMNS} FROM admin_users WHERE email = $1`,
    [email.toLowerCase()],
  );
  if (!row || row.disabled) {
    // Spend the same effort as a real check, so timing does not reveal
    // which email addresses have an account.
    await hashPassword(password);
    return null;
  }
  if (!(await verifyPassword(password, row.password_hash))) return null;
  await query("UPDATE admin_users SET last_login_at = now() WHERE id = $1", [row.id]);
  return row;
}

export async function startSession(admin: Signable) {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const value = `${admin.id}.${expires}.${sign(admin, expires)}`;
  (await cookies()).set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expires),
  });
}

/** Signs out: clears this browser's cookie and makes every copy of it worthless. */
export async function endSession() {
  const admin = await getAdmin();
  if (admin) {
    await query("UPDATE admin_users SET session_epoch = session_epoch + 1 WHERE id = $1", [
      admin.id,
    ]).catch((error) => console.error("Admin: sessions could not be ended.", error));
  }
  (await cookies()).delete(COOKIE);
}

/** What a session cookie is signed with, for issuing a fresh one. */
export async function signableOf(id: number): Promise<Signable | null> {
  const [row] = await query<Signable>(
    "SELECT id, password_hash, session_epoch FROM admin_users WHERE id = $1",
    [id],
  );
  return row ?? null;
}

/**
 * The signed-in admin, or null. Looked up once per request however many
 * parts of the page ask, and never trusted from the cookie alone: a disabled
 * or deleted admin is refused on their very next request.
 */
export const getAdmin = cache(async function getAdmin(): Promise<Admin | null> {
  // Admin pages are always rendered for the request in hand, never ahead of
  // time: the session has an expiry, so "now" has to be the real now.
  await connection();
  if (setupProblem()) return null;

  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return null;

  const [idPart, expiresPart, signature] = value.split(".");
  const id = Number(idPart);
  const expires = Number(expiresPart);
  if (!Number.isInteger(id) || !Number.isFinite(expires) || !signature) {
    return null;
  }
  if (expires < Date.now()) return null;

  let row: AdminRow | undefined;
  try {
    [row] = await query<AdminRow>(
      `SELECT ${ADMIN_COLUMNS} FROM admin_users WHERE id = $1`,
      [id],
    );
  } catch (error) {
    console.error("Admin: the session could not be checked.", error);
    return null;
  }
  // A disabled account is signed out on its very next click.
  if (!row || row.disabled) return null;

  const expected = Buffer.from(sign(row, expires));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return null;
  }
  return { id: row.id, email: row.email, name: row.name, role: row.role };
});

/** For every admin page and action: sends anyone not signed in to the login page. */
export async function requireAdmin(): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** For managing other admins: only the primary administrator may. */
export async function requireOwner(): Promise<Admin> {
  const admin = await requireAdmin();
  if (admin.role !== "owner") redirect("/admin");
  return admin;
}

/** The stored hash, for re-checking the current password before changing it. */
export async function passwordHashOf(id: number) {
  return (await signableOf(id))?.password_hash ?? null;
}
