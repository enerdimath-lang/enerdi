import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import {
  conformSection,
  defaults,
  type SectionKey,
  type SiteContent,
} from "@/content/sections";
import { dbConfigured, query } from "./db";

type Row = { key: string; draft: unknown; published: unknown };

/**
 * The published text of the whole website.
 *
 * Cached, and refreshed the moment the admin publishes a change. If the
 * database cannot be reached the site falls back to the built-in text and
 * tries again a minute later, so a database problem never takes the site down.
 */
export async function getContent(): Promise<SiteContent> {
  "use cache";
  cacheTag("content");

  if (!dbConfigured()) {
    cacheLife("minutes");
    return defaults;
  }

  try {
    const rows = await query<Row>(
      "SELECT key, published FROM site_content WHERE published IS NOT NULL",
    );
    const saved = new Map(rows.map((row) => [row.key, row.published]));
    const content: Record<string, unknown> = {};
    for (const [key, template] of Object.entries(defaults)) {
      content[key] = saved.has(key)
        ? conformSection(key as SectionKey, saved.get(key))
        : template;
    }
    cacheLife("hours");
    return content as SiteContent;
  } catch (error) {
    console.error("Content: falling back to the built-in text.", error);
    cacheLife("minutes");
    return defaults;
  }
}

/**
 * The website as it would look if every saved draft were published: each
 * section's draft if it has one, otherwise what is live. Admin preview only,
 * never cached and never used by a public page.
 */
export async function getDraftContent(): Promise<SiteContent> {
  const rows = await query<Row>("SELECT key, draft, published FROM site_content");
  const saved = new Map(rows.map((row) => [row.key, row.draft ?? row.published]));
  const content: Record<string, unknown> = {};
  for (const [key, template] of Object.entries(defaults)) {
    const value = saved.get(key);
    content[key] = value != null ? conformSection(key as SectionKey, value) : template;
  }
  return content as SiteContent;
}

export type SectionState<K extends SectionKey> = {
  /** What the admin form should show: the draft if there is one. */
  working: SiteContent[K];
  hasDraft: boolean;
  isCustomised: boolean;
  updatedAt: Date | null;
};

/** For the admin form. Not cached: the admin always sees the latest save. */
export async function getSectionForEditing<K extends SectionKey>(
  key: K,
): Promise<SectionState<K>> {
  const [row] = await query<Row & { updated_at: Date }>(
    "SELECT key, draft, published, updated_at FROM site_content WHERE key = $1",
    [key],
  );
  const template = defaults[key];
  const published = row?.published != null ? conformSection(key, row.published) : template;
  return {
    working: row?.draft != null ? conformSection(key, row.draft) : published,
    hasDraft: row?.draft != null,
    isCustomised: row?.published != null,
    updatedAt: row?.updated_at ?? null,
  };
}

/** Which sections have an unpublished draft or differ from the built-in text. */
export async function getSectionStatuses() {
  const rows = await query<{ key: string; has_draft: boolean; customised: boolean; updated_at: Date }>(
    `SELECT key, draft IS NOT NULL AS has_draft, published IS NOT NULL AS customised, updated_at
     FROM site_content`,
  );
  return new Map(rows.map((row) => [row.key, row]));
}

export async function saveSection(
  key: SectionKey,
  value: unknown,
  publish: boolean,
) {
  const clean = JSON.stringify(conformSection(key, value));
  if (publish) {
    await query(
      `INSERT INTO site_content (key, draft, published, updated_at)
       VALUES ($1, NULL, $2::jsonb, now())
       ON CONFLICT (key) DO UPDATE SET draft = NULL, published = $2::jsonb, updated_at = now()`,
      [key, clean],
    );
  } else {
    await query(
      `INSERT INTO site_content (key, draft, updated_at)
       VALUES ($1, $2::jsonb, now())
       ON CONFLICT (key) DO UPDATE SET draft = $2::jsonb, updated_at = now()`,
      [key, clean],
    );
  }
}

/** Throws away the saved version, so the section shows the built-in text again. */
export async function resetSection(key: SectionKey) {
  await query("DELETE FROM site_content WHERE key = $1", [key]);
}
