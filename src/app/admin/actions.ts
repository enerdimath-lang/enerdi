"use server";

import { refresh, updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { overLimit, recordUse, type Allowance } from "@/app/api/contact/rate-limit";
import { isSectionKey, sections } from "@/content/sections";
import { logActivity } from "@/lib/activity";
import {
  checkCredentials,
  endSession,
  hashPassword,
  passwordHashOf,
  requireAdmin,
  requireOwner,
  setupProblem,
  signableOf,
  startSession,
  verifyPassword,
} from "@/lib/auth";
import {
  catalogKinds,
  deleteCatalogItem,
  getCatalogItem,
  isCatalogKind,
  reorderCatalog,
  saveCatalogItem,
  setCatalogStatus,
  type PublishStatus,
} from "@/lib/catalog";
import { resetSection, saveSection } from "@/lib/content";
import { query } from "@/lib/db";
import { deleteEnquiry, isEnquiryStatus, setEnquiryStatus } from "@/lib/enquiries";
import { deleteMedia, updateMediaDetails, usedMediaIds } from "@/lib/media";
import { isMenuName, isSafeHref, saveMenu, type MenuItem } from "@/lib/navigation";
import {
  deletePost,
  getPost,
  postKinds,
  savePost,
  setPostStatus,
  type PostType,
} from "@/lib/posts";
import { isSeoPageKey, saveSeo, seoPages } from "@/lib/seo";

/**
 * Everything the admin panel can change. Every action except signing in
 * starts by checking the session, so none of them can be called by a visitor,
 * and every change is written to the activity log.
 */

export type FormState = { error?: string; ok?: string } | null;

const MAX_LOGIN_ATTEMPTS = 8;

function text(formData: FormData, name: string, max: number) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Image and page addresses must stay on this site or be ordinary web addresses. */
function cleanUrl(value: string) {
  if (!value) return "";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return /^https?:\/\/\S+$/i.test(value) ? value : "";
}

function isStatus(value: unknown): value is PublishStatus {
  return value === "draft" || value === "published" || value === "unpublished";
}

/** "publish" and "unpublish" set the state; anything else keeps what it was. */
function nextStatus(intent: unknown, current: PublishStatus | null): PublishStatus {
  if (intent === "publish") return "published";
  if (intent === "unpublish") return "unpublished";
  return current ?? "draft";
}

const statusMessage: Record<PublishStatus, string> = {
  published: "Published. It is live on the website now.",
  draft: "Saved as a draft. Visitors cannot see it.",
  unpublished: "Unpublished. Visitors can no longer see it.",
};

const noindexError =
  'This is set to be hidden from search engines. Tick "Yes, hide it from Google" to confirm, or untick the option.';

const databaseError =
  "The database could not be reached. Check the PostgreSQL settings and try again.";

const emailPattern = /^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/;

/* ---------- Signing in and out ---------- */

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const problem = setupProblem();
  if (problem) return { error: problem };

  const email = text(formData, "email", 200).toLowerCase();
  const password = String(formData.get("password") ?? "").slice(0, 200);
  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const requestHeaders = await headers();
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip")?.trim() ||
    "unknown";
  const allowances: Allowance[] = [
    { key: `login-ip:${ip}`, limit: MAX_LOGIN_ATTEMPTS },
    { key: `login-email:${email}`, limit: MAX_LOGIN_ATTEMPTS },
  ];
  if (overLimit(allowances)) {
    return { error: "Too many attempts. Please wait 15 minutes and try again." };
  }

  let admin;
  try {
    admin = await checkCredentials(email, password);
  } catch (error) {
    console.error("Admin login: the database could not be reached.", error);
    return { error: databaseError };
  }
  if (!admin) {
    recordUse(allowances);
    // Logged, but capped: a flood of guesses must not fill the activity log.
    const logging: Allowance[] = [{ key: "failed-login-log", limit: 60 }];
    if (!overLimit(logging)) {
      recordUse(logging);
      await logActivity(null, "Failed sign-in", "Account", email);
    }
    return { error: "That email and password do not match." };
  }

  await startSession(admin);
  await logActivity(admin, "Signed in", "Account");
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

function passwordProblem(next: string, repeat: string) {
  if (next.length < 10) return "The new password needs at least 10 characters.";
  if (next.length > 200) return "The new password is too long.";
  if (next !== repeat) return "The two new passwords are not the same.";
  return null;
}

export async function changePassword(_: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const problem = passwordProblem(next, String(formData.get("repeat") ?? ""));
  if (problem) return { error: problem };

  const stored = await passwordHashOf(admin.id);
  if (!stored || !(await verifyPassword(current, stored))) {
    return { error: "The current password is not right." };
  }

  const hash = await hashPassword(next);
  await query("UPDATE admin_users SET password_hash = $1 WHERE id = $2", [hash, admin.id]);
  // The old cookie was signed with the old password, so issue a new one.
  const fresh = await signableOf(admin.id);
  if (fresh) await startSession(fresh);
  await logActivity(admin, "Changed password", "Account");
  return { ok: "Password changed. Other devices have been signed out." };
}

export async function updateProfile(_: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const name = text(formData, "name", 80);
  const email = text(formData, "email", 200).toLowerCase();
  if (!name) return { error: "Please enter your name." };
  if (!emailPattern.test(email)) return { error: "Please enter a valid email address." };

  if (email !== admin.email) {
    // The email is the login, so changing it needs the password again.
    const stored = await passwordHashOf(admin.id);
    const current = String(formData.get("current") ?? "");
    if (!stored || !(await verifyPassword(current, stored))) {
      return { error: "Enter your current password to change the email address." };
    }
    const taken = await query("SELECT 1 FROM admin_users WHERE email = $1 AND id <> $2", [
      email,
      admin.id,
    ]);
    if (taken.length > 0) return { error: "Another admin already uses that email." };
  }

  await query("UPDATE admin_users SET name = $1, email = $2 WHERE id = $3", [name, email, admin.id]);
  await logActivity({ id: admin.id, email }, "Updated profile", "Account");
  refresh();
  return { ok: "Saved." };
}

/* ---------- Admin users (primary administrator only) ---------- */

export async function createAdminAction(_: FormState, formData: FormData): Promise<FormState> {
  const owner = await requireOwner();
  const name = text(formData, "name", 80);
  const email = text(formData, "email", 200).toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!name) return { error: "Please enter a name." };
  if (!emailPattern.test(email)) return { error: "Please enter a valid email address." };
  const problem = passwordProblem(password, password);
  if (problem) return { error: problem.replace("new password", "password") };

  const existing = await query("SELECT 1 FROM admin_users WHERE email = $1", [email]);
  if (existing.length > 0) return { error: "An admin with that email already exists." };

  await query(
    "INSERT INTO admin_users (email, name, password_hash, role) VALUES ($1, $2, $3, 'admin')",
    [email, name, await hashPassword(password)],
  );
  await logActivity(owner, "Created admin", "Admin users", email);
  refresh();
  return { ok: `${name} can now sign in with that email and password.` };
}

/** Disable, enable, delete or set a new password for another admin. */
export async function manageAdminAction(_: FormState, formData: FormData): Promise<FormState> {
  const owner = await requireOwner();
  const id = Number(formData.get("id"));
  const intent = formData.get("intent");
  const [target] = await query<{ id: number; email: string; role: string }>(
    "SELECT id, email, role FROM admin_users WHERE id = $1",
    [Number.isInteger(id) ? id : -1],
  );
  if (!target) return { error: "That admin no longer exists." };
  if (target.id === owner.id || target.role === "owner") {
    return { error: "The primary administrator cannot be changed here." };
  }

  if (intent === "disable" || intent === "enable") {
    await query("UPDATE admin_users SET disabled = $1 WHERE id = $2", [intent === "disable", id]);
    await logActivity(owner, intent === "disable" ? "Disabled admin" : "Enabled admin", "Admin users", target.email);
    refresh();
    return {
      ok:
        intent === "disable"
          ? `${target.email} can no longer sign in.`
          : `${target.email} can sign in again.`,
    };
  }
  if (intent === "delete") {
    await query("DELETE FROM admin_users WHERE id = $1", [id]);
    await logActivity(owner, "Deleted admin", "Admin users", target.email);
    refresh();
    return { ok: `${target.email} was deleted.` };
  }
  if (intent === "password") {
    const password = String(formData.get("password") ?? "");
    const problem = passwordProblem(password, password);
    if (problem) return { error: problem };
    await query("UPDATE admin_users SET password_hash = $1 WHERE id = $2", [
      await hashPassword(password),
      id,
    ]);
    await logActivity(owner, "Reset admin password", "Admin users", target.email);
    refresh();
    return { ok: `New password set for ${target.email}. They have been signed out everywhere.` };
  }
  return { error: "Unknown action." };
}

/* ---------- Articles and blog posts ---------- */

export async function savePostAction(_: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();

  const type = text(formData, "type", 20) as PostType;
  if (!Object.hasOwn(postKinds, type)) return { error: "Unknown kind of post." };

  const idValue = text(formData, "id", 20);
  const id = idValue ? Number(idValue) : null;
  if (id !== null && !Number.isInteger(id)) return { error: "Unknown post." };

  const title = text(formData, "title", 200);
  if (!title) return { error: "Please give it a title." };

  const body = String(formData.get("body") ?? "").slice(0, 200_000);
  const noindex = formData.get("noindex") === "on";

  let savedId: number;
  let status: PublishStatus;
  try {
    const existing = id === null ? null : await getPost(id);
    if (id !== null && (!existing || existing.type !== type)) return { error: "Unknown post." };

    status = nextStatus(formData.get("intent"), existing?.status ?? null);
    if (status === "published" && !body.trim()) {
      return { error: "There is no text yet. Write something before publishing." };
    }
    if (status === "published" && noindex && formData.get("confirm_noindex") !== "on") {
      return { error: noindexError };
    }

    savedId = await savePost(id, {
      type,
      title,
      slug: text(formData, "slug", 120),
      excerpt: text(formData, "excerpt", 400),
      body,
      topic: text(formData, "topic", 120),
      cover_url: cleanUrl(text(formData, "cover_url", 500)),
      author: text(formData, "author", 120) || admin.name,
      status,
      tags: text(formData, "tags", 300),
      seo_title: text(formData, "seo_title", 160),
      seo_description: text(formData, "seo_description", 320),
      canonical_url: cleanUrl(text(formData, "canonical_url", 500)),
      noindex,
      og_title: text(formData, "og_title", 160),
      og_description: text(formData, "og_description", 320),
      og_image: cleanUrl(text(formData, "og_image", 500)),
      og_image_alt: text(formData, "og_image_alt", 200),
    });
  } catch (error) {
    console.error("Admin: the post could not be saved.", error);
    return { error: databaseError };
  }

  updateTag("posts");
  await logActivity(
    admin,
    id === null ? "Created" : status === "published" ? "Published" : "Saved",
    postKinds[type].plural,
    title,
  );

  if (id === null) {
    redirect(`/admin/posts/${postKinds[type].admin}/${savedId}?saved=${status}`);
  }
  return { ok: statusMessage[status] };
}

export async function setPostStatusAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = Number(formData.get("id"));
  const status = formData.get("status");
  if (!Number.isInteger(id) || !isStatus(status)) return;

  const post = await getPost(id);
  if (!post) return;
  // Publishing from the list skips the form, so it must not skip the form's
  // checks. A post that fails them opens in the editor with the reason shown.
  if (status === "published" && (!post.body.trim() || post.noindex)) {
    redirect(
      `/admin/posts/${postKinds[post.type].admin}/${post.id}?saved=${post.noindex ? "blocked-noindex" : "blocked-empty"}`,
    );
  }
  await setPostStatus(id, status);
  updateTag("posts");
  await logActivity(admin, status === "published" ? "Published" : "Unpublished", postKinds[post.type].plural, post.title);
}

export async function deletePostAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  const post = await getPost(id);
  if (!post) return;
  await deletePost(id);
  updateTag("posts");
  await logActivity(admin, "Deleted", postKinds[post.type].plural, post.title);
  redirect(`/admin/posts/${postKinds[post.type].admin}`);
}

/* ---------- Products and services ---------- */

export async function saveCatalogAction(_: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const kind = text(formData, "kind", 20);
  if (!isCatalogKind(kind)) return { error: "Unknown kind of item." };

  const idValue = text(formData, "id", 20);
  const id = idValue ? Number(idValue) : null;
  if (id !== null && !Number.isInteger(id)) return { error: "Unknown item." };

  const name = text(formData, "name", 120);
  if (!name) return { error: "Please give it a name." };

  let savedId: number;
  let status: PublishStatus;
  try {
    const existing = id === null ? null : await getCatalogItem(kind, id);
    if (id !== null && !existing) return { error: "Unknown item." };
    status = nextStatus(formData.get("intent"), existing?.status ?? null);
    savedId = await saveCatalogItem(kind, id, {
      name,
      full_name: text(formData, "full_name", 160),
      category: text(formData, "category", 80),
      description: text(formData, "description", 4000),
      image_url: cleanUrl(text(formData, "image_url", 500)),
      status,
    });
  } catch (error) {
    console.error("Admin: the item could not be saved.", error);
    return { error: databaseError };
  }

  updateTag("catalog");
  await logActivity(
    admin,
    id === null ? "Created" : status === "published" ? "Published" : "Saved",
    catalogKinds[kind].plural,
    name,
  );
  if (id === null) redirect(`/admin/catalog/${kind}/${savedId}?saved=${status}`);
  return { ok: statusMessage[status] };
}

export async function setCatalogStatusAction(formData: FormData) {
  const admin = await requireAdmin();
  const kind = text(formData, "kind", 20);
  const id = Number(formData.get("id"));
  const status = formData.get("status");
  if (!isCatalogKind(kind) || !Number.isInteger(id) || !isStatus(status)) return;
  const item = await getCatalogItem(kind, id);
  if (!item) return;
  await setCatalogStatus(kind, id, status);
  updateTag("catalog");
  await logActivity(admin, status === "published" ? "Published" : "Unpublished", catalogKinds[kind].plural, item.name);
}

export async function deleteCatalogAction(formData: FormData) {
  const admin = await requireAdmin();
  const kind = text(formData, "kind", 20);
  const id = Number(formData.get("id"));
  if (!isCatalogKind(kind) || !Number.isInteger(id)) return;
  const item = await getCatalogItem(kind, id);
  if (!item) return;
  await deleteCatalogItem(kind, id);
  updateTag("catalog");
  await logActivity(admin, "Deleted", catalogKinds[kind].plural, item.name);
  redirect(`/admin/catalog/${kind}`);
}

/** Called by the drag-and-drop list with the ids in their new order. */
export async function reorderCatalogAction(kind: string, ids: number[]) {
  const admin = await requireAdmin();
  if (!isCatalogKind(kind) || !Array.isArray(ids)) return { error: "Invalid request." };
  const clean = ids.filter((id) => Number.isInteger(id)).slice(0, 500);
  try {
    await reorderCatalog(kind, clean);
  } catch (error) {
    console.error("Admin: the order could not be saved.", error);
    return { error: databaseError };
  }
  updateTag("catalog");
  await logActivity(admin, "Reordered", catalogKinds[kind].plural);
  return { ok: "Order saved." };
}

/* ---------- Page text ---------- */

export async function saveContentAction(_: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();

  const key = text(formData, "key", 40);
  if (!isSectionKey(key)) return { error: "Unknown section." };
  const intent = formData.get("intent");
  const returnTo = text(formData, "return_to", 200);

  if (intent === "reset") {
    try {
      await resetSection(key);
    } catch (error) {
      console.error("Admin: the section could not be reset.", error);
      return { error: databaseError };
    }
    updateTag("content");
    await logActivity(admin, "Reset to original", "Page text", sections[key].label);
    // Reloads the form so it shows the original text again.
    const back = returnTo.startsWith("/admin/") ? returnTo : "/admin";
    redirect(`${back}?reset=${Date.now()}`);
  }

  let value: unknown;
  try {
    value = JSON.parse(String(formData.get("json") ?? ""));
  } catch {
    return { error: "The form could not be read. Reload the page and try again." };
  }

  const publish = intent === "publish";
  try {
    await saveSection(key, value, publish);
  } catch (error) {
    console.error("Admin: the section could not be saved.", error);
    return { error: databaseError };
  }
  if (publish) updateTag("content");
  await logActivity(admin, publish ? "Published" : "Saved draft", "Page text", sections[key].label);
  return {
    ok: publish
      ? "Published. The website shows the new text now."
      : "Draft saved. The website still shows the published text.",
  };
}

/* ---------- Menus ---------- */

function cleanMenu(value: unknown, depth = 0): MenuItem[] | string {
  if (!Array.isArray(value)) return "The menu could not be read. Reload the page and try again.";
  const items: MenuItem[] = [];
  for (const raw of value.slice(0, depth === 0 ? 30 : 15)) {
    const source = (raw ?? {}) as Record<string, unknown>;
    const label = typeof source.label === "string" ? source.label.trim().slice(0, 60) : "";
    const href = typeof source.href === "string" ? source.href.trim().slice(0, 300) : "";
    if (!label) return "Every menu item needs a label.";
    if (!isSafeHref(href)) {
      return `"${label}" needs a link such as /about or https://example.com.`;
    }
    const children = depth === 0 ? cleanMenu(source.children ?? [], 1) : [];
    if (typeof children === "string") return children;
    items.push({
      label,
      href,
      enabled: source.enabled !== false,
      newTab: source.newTab === true,
      children,
    });
  }
  return items;
}

export async function saveMenuAction(_: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const menu = text(formData, "menu", 20);
  if (!isMenuName(menu)) return { error: "Unknown menu." };

  let parsed: unknown;
  try {
    parsed = JSON.parse(String(formData.get("json") ?? ""));
  } catch {
    return { error: "The menu could not be read. Reload the page and try again." };
  }
  const items = cleanMenu(parsed);
  if (typeof items === "string") return { error: items };

  try {
    await saveMenu(menu, items);
  } catch (error) {
    console.error("Admin: the menu could not be saved.", error);
    return { error: databaseError };
  }
  updateTag("navigation");
  await logActivity(admin, "Saved menu", "Navigation", menu === "header" ? "Header menu" : "Footer menu");
  return { ok: "Saved. The website menu is updated." };
}

/* ---------- SEO ---------- */

export async function saveSeoAction(_: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const key = text(formData, "key", 40);
  if (!isSeoPageKey(key)) return { error: "Unknown page." };

  const noindex = formData.get("noindex") === "on";
  if (noindex && formData.get("confirm_noindex") !== "on") return { error: noindexError };

  try {
    await saveSeo(key, {
      title: text(formData, "title", 160),
      description: text(formData, "description", 320),
      canonical_url: cleanUrl(text(formData, "canonical_url", 500)),
      noindex,
      og_title: text(formData, "og_title", 160),
      og_description: text(formData, "og_description", 320),
      og_image: cleanUrl(text(formData, "og_image", 500)),
      og_image_alt: text(formData, "og_image_alt", 200),
    });
  } catch (error) {
    console.error("Admin: the SEO settings could not be saved.", error);
    return { error: databaseError };
  }
  updateTag("seo");
  await logActivity(admin, "Saved SEO", "SEO", seoPages.find((page) => page.key === key)!.label);
  return { ok: "Saved. The page uses these settings now." };
}

/* ---------- Enquiries ---------- */

export async function setEnquiryStatusAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = Number(formData.get("id"));
  const status = formData.get("status");
  if (!Number.isInteger(id) || !isEnquiryStatus(status)) return;
  await setEnquiryStatus(id, status);
  await logActivity(admin, `Marked enquiry ${status.replace("_", " ")}`, "Enquiries", `#${id}`);
  refresh();
}

export async function deleteEnquiryAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  await deleteEnquiry(id);
  await logActivity(admin, "Deleted enquiry", "Enquiries", `#${id}`);
  refresh();
}

/* ---------- Images ---------- */

export async function updateMediaAction(_: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const id = text(formData, "id", 60);
  const filename = text(formData, "filename", 120);
  if (!id || !filename) return { error: "Please give the image a name." };
  try {
    await updateMediaDetails(id, filename, text(formData, "alt", 300));
  } catch (error) {
    console.error("Admin: the image details could not be saved.", error);
    return { error: databaseError };
  }
  await logActivity(admin, "Edited image details", "Media", filename);
  refresh();
  return { ok: "Saved." };
}

export async function deleteMediaAction(_: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const id = text(formData, "id", 60);
  if (!id) return { error: "Unknown image." };
  try {
    // An image that a page still shows is only deleted when asked twice.
    if (formData.get("force") !== "on" && (await usedMediaIds([id])).has(id)) {
      return {
        error:
          'This image is in use on the website. Tick "Delete even though it is in use" to remove it anyway.',
      };
    }
    await deleteMedia(id);
  } catch (error) {
    console.error("Admin: the image could not be deleted.", error);
    return { error: databaseError };
  }
  await logActivity(admin, "Deleted image", "Media", id);
  redirect("/admin/media");
}
