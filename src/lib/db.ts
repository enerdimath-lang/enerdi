import "server-only";
import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { footerNavigation, navigation, products, services } from "@/content/site";

/**
 * The PostgreSQL connection used by the admin panel and the public pages.
 *
 * Settings come from `.env.local` (see `.env.example`):
 * - on your own PostgreSQL: PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
 * - on Supabase (or any hosted Postgres): DATABASE_URL, which wins if set
 *
 * The tables are created automatically the first time the site talks to the
 * database, so the only manual step is creating an empty database.
 */

function setting(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

/** True once the database settings have been filled in. */
export function dbConfigured() {
  return Boolean(setting("DATABASE_URL") || setting("PGDATABASE"));
}

/**
 * How to encrypt the connection.
 *
 * Hosted databases (Supabase included) require TLS. Their certificates are
 * signed by the provider's own authority, which Node does not know, so there
 * are two ways to connect:
 * - DATABASE_CA_CERT holds the provider's CA certificate (the text of the
 *   .crt file): the server is fully verified. Use this in production.
 * - without it, the connection is encrypted but the server is not verified.
 */
function sslSettings(url: URL | null) {
  const mode = url?.searchParams.get("sslmode");
  const flag = setting("DATABASE_SSL");
  const wanted =
    flag === "true" ||
    (flag !== "false" &&
      ((mode != null && mode !== "disable") || Boolean(url?.hostname.includes("supabase"))));
  if (!wanted) return undefined;

  const ca = setting("DATABASE_CA_CERT")?.replace(/\\n/g, "\n");
  return ca ? { ca, rejectUnauthorized: true } : { rejectUnauthorized: false };
}

function createPool() {
  const raw = setting("DATABASE_URL");
  let url: URL | null = null;
  if (raw) {
    try {
      url = new URL(raw);
    } catch {
      throw new Error("DATABASE_URL is not a valid connection string.");
    }
  }
  const ssl = sslSettings(url);
  // The driver would let "sslmode" in the address override the settings
  // above, so it is taken out once it has been read.
  url?.searchParams.delete("sslmode");

  return new Pool({
    ...(url
      ? { connectionString: url.toString() }
      : {
          host: setting("PGHOST") ?? "localhost",
          port: Number(setting("PGPORT")) || 5432,
          user: setting("PGUSER") ?? "postgres",
          password: setting("PGPASSWORD") ?? "",
          database: setting("PGDATABASE"),
        }),
    ssl,
    max: Number(setting("DATABASE_POOL_SIZE")) || 5,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  });
}

/** Products and services are the same kind of record, kept in two tables. */
const catalogTable = (name: "products" | "services") => `
  CREATE TABLE IF NOT EXISTS ${name} (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    full_name   TEXT NOT NULL DEFAULT '',
    category    TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    image_url   TEXT NOT NULL DEFAULT '',
    position    INTEGER NOT NULL DEFAULT 0,
    status      TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'unpublished')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS ${name}_public_idx ON ${name} (status, position);
`;

/**
 * Database changes, in order. Each one runs once and is then recorded in
 * `schema_migrations`, so updating the site never repeats or skips a step.
 * To change the database later, add a new entry at the end: never edit one
 * that has already run somewhere.
 */
const MIGRATIONS: (string | ((client: PoolClient) => Promise<void>))[] = [
  // 1. Admins, articles and blog posts, images, page text.
  `
  CREATE TABLE IF NOT EXISTS admin_users (
    id            SERIAL PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE,
    name          TEXT NOT NULL DEFAULT '',
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS posts (
    id           SERIAL PRIMARY KEY,
    type         TEXT NOT NULL CHECK (type IN ('article', 'blog')),
    title        TEXT NOT NULL,
    slug         TEXT NOT NULL,
    excerpt      TEXT NOT NULL DEFAULT '',
    body         TEXT NOT NULL DEFAULT '',
    topic        TEXT NOT NULL DEFAULT '',
    cover_url    TEXT NOT NULL DEFAULT '',
    author       TEXT NOT NULL DEFAULT '',
    status       TEXT NOT NULL DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (type, slug)
  );

  CREATE TABLE IF NOT EXISTS media (
    id         TEXT PRIMARY KEY,
    filename   TEXT NOT NULL,
    mime       TEXT NOT NULL,
    bytes      INTEGER NOT NULL,
    data       BYTEA NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS site_content (
    key        TEXT PRIMARY KEY,
    draft      JSONB,
    published  JSONB,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  `,

  // 2. The full CMS: roles, three publishing states, SEO, products, services,
  //    menus, enquiries and the activity log.
  `
  ALTER TABLE admin_users
    ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('owner', 'admin')),
    ADD COLUMN IF NOT EXISTS disabled BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
  UPDATE admin_users SET role = 'owner' WHERE id = (SELECT min(id) FROM admin_users);

  ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_status_check;
  ALTER TABLE posts
    ADD CONSTRAINT posts_status_check CHECK (status IN ('draft', 'published', 'unpublished')),
    ADD COLUMN IF NOT EXISTS tags TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS seo_title TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS seo_description TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS canonical_url TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS noindex BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS og_title TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS og_description TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS og_image TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS og_image_alt TEXT NOT NULL DEFAULT '';
  CREATE INDEX IF NOT EXISTS posts_public_idx ON posts (type, status, published_at DESC);

  ALTER TABLE media
    ADD COLUMN IF NOT EXISTS alt TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS width INTEGER,
    ADD COLUMN IF NOT EXISTS height INTEGER,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

  ${catalogTable("products")}
  ${catalogTable("services")}

  CREATE TABLE IF NOT EXISTS navigation_items (
    id        SERIAL PRIMARY KEY,
    menu      TEXT NOT NULL CHECK (menu IN ('header', 'footer')),
    parent_id INTEGER REFERENCES navigation_items (id) ON DELETE CASCADE,
    label     TEXT NOT NULL,
    href      TEXT NOT NULL,
    position  INTEGER NOT NULL DEFAULT 0,
    enabled   BOOLEAN NOT NULL DEFAULT true,
    new_tab   BOOLEAN NOT NULL DEFAULT false
  );
  CREATE INDEX IF NOT EXISTS navigation_items_menu_idx ON navigation_items (menu, parent_id, position);

  CREATE TABLE IF NOT EXISTS contact_enquiries (
    id         SERIAL PRIMARY KEY,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    phone      TEXT NOT NULL DEFAULT '',
    company    TEXT NOT NULL DEFAULT '',
    message    TEXT NOT NULL,
    status     TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed')),
    email_sent BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS contact_enquiries_idx ON contact_enquiries (status, created_at DESC);

  CREATE TABLE IF NOT EXISTS seo_metadata (
    page_key       TEXT PRIMARY KEY,
    title          TEXT NOT NULL DEFAULT '',
    description    TEXT NOT NULL DEFAULT '',
    canonical_url  TEXT NOT NULL DEFAULT '',
    noindex        BOOLEAN NOT NULL DEFAULT false,
    og_title       TEXT NOT NULL DEFAULT '',
    og_description TEXT NOT NULL DEFAULT '',
    og_image       TEXT NOT NULL DEFAULT '',
    og_image_alt   TEXT NOT NULL DEFAULT '',
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id          BIGSERIAL PRIMARY KEY,
    admin_id    INTEGER REFERENCES admin_users (id) ON DELETE SET NULL,
    admin_email TEXT NOT NULL DEFAULT '',
    action      TEXT NOT NULL,
    entity      TEXT NOT NULL DEFAULT '',
    detail      TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS activity_logs_idx ON activity_logs (created_at DESC);
  `,

  // 3. Start the new tables off with what the website already shows.
  async (client) => {
    for (const [table, items] of [
      ["products", products],
      ["services", services],
    ] as const) {
      for (const [position, item] of items.entries()) {
        await client.query(
          `INSERT INTO ${table} (name, full_name, category, description, image_url, position, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'published')`,
          [item.name, item.fullName, item.category, item.text, item.image, position],
        );
      }
    }
    for (const [menu, items] of [
      ["header", navigation],
      ["footer", footerNavigation],
    ] as const) {
      for (const [position, item] of items.entries()) {
        await client.query(
          "INSERT INTO navigation_items (menu, label, href, position) VALUES ($1, $2, $3, $4)",
          [menu, item.label, item.href, position],
        );
      }
    }
  },

  // 4. Hardening.
  //    - session_epoch lets signing out end every session of that admin.
  //    - Row level security with no policies closes these tables to
  //      Supabase's auto-generated Data API (its "anon" and "authenticated"
  //      roles), which would otherwise expose them, password hashes and
  //      enquiries included. The website connects as the tables' owner, which
  //      row level security does not restrict, so nothing changes for it. On
  //      an ordinary PostgreSQL this has no effect.
  `
  ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS session_epoch INTEGER NOT NULL DEFAULT 0;

  ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
  ALTER TABLE media ENABLE ROW LEVEL SECURITY;
  ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
  ALTER TABLE products ENABLE ROW LEVEL SECURITY;
  ALTER TABLE services ENABLE ROW LEVEL SECURITY;
  ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;
  ALTER TABLE contact_enquiries ENABLE ROW LEVEL SECURITY;
  ALTER TABLE seo_metadata ENABLE ROW LEVEL SECURITY;
  ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
  ALTER TABLE schema_migrations ENABLE ROW LEVEL SECURITY;
  `,
];

type Store = { pool?: Pool; ready?: Promise<void> };

// Kept on globalThis so `next dev` reloads do not open a new pool each time.
const store = globalThis as typeof globalThis & { __enerdiDb?: Store };
const db: Store = (store.__enerdiDb ??= {});

async function migrate(pool: Pool) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // The lock stops two first requests racing to run the same step.
    await client.query("SELECT pg_advisory_xact_lock(727274)");
    await client.query(
      "CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())",
    );
    const { rows } = await client.query<{ version: number }>(
      "SELECT COALESCE(max(version), 0) AS version FROM schema_migrations",
    );
    for (let version = rows[0].version + 1; version <= MIGRATIONS.length; version += 1) {
      const step = MIGRATIONS[version - 1];
      if (typeof step === "string") await client.query(step);
      else await step(client);
      await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [version]);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

async function ready() {
  const pool = (db.pool ??= createPool());
  db.ready ??= migrate(pool);

  try {
    await db.ready;
  } catch (error) {
    // Forget the failure so the next request tries again.
    db.ready = undefined;
    throw error;
  }
  return pool;
}

/** Runs one query and returns its rows. Throws if the database is not set up. */
export async function query<Row extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = [],
) {
  if (!dbConfigured()) {
    throw new Error("The database is not configured (see .env.example).");
  }
  const pool = await ready();
  const result = await pool.query<Row>(text, values);
  return result.rows;
}

/** Runs several queries as one all-or-nothing change. */
export async function transaction<T>(work: (client: PoolClient) => Promise<T>) {
  if (!dbConfigured()) {
    throw new Error("The database is not configured (see .env.example).");
  }
  const client = await (await ready()).connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
