import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { dbConfigured, query } from "./db";
import { slugify } from "./slug";

export type PostType = "article" | "blog";
export type PostStatus = "draft" | "published" | "unpublished";

export type Post = {
  id: number;
  type: PostType;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  topic: string;
  cover_url: string;
  author: string;
  status: PostStatus;
  tags: string;
  seo_title: string;
  seo_description: string;
  canonical_url: string;
  noindex: boolean;
  og_title: string;
  og_description: string;
  og_image: string;
  og_image_alt: string;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

/** "energy, data ,  twins" -> ["energy", "data", "twins"] */
export function splitTags(tags: string) {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export type PostSummary = Omit<Post, "body">;

const SUMMARY =
  "id, type, title, slug, excerpt, topic, cover_url, author, status, tags, seo_title, seo_description, canonical_url, noindex, og_title, og_description, og_image, og_image_alt, published_at, created_at, updated_at";

/** Where each kind of post lives on the public site and in the admin panel. */
export const postKinds = {
  article: {
    type: "article" as const,
    path: "/knowledge-hub",
    admin: "articles",
    singular: "article",
    plural: "Knowledge Hub articles",
  },
  blog: {
    type: "blog" as const,
    path: "/blog",
    admin: "blog",
    singular: "blog post",
    plural: "Blog posts",
  },
};

export function kindFromAdminSegment(segment: string) {
  return Object.values(postKinds).find((kind) => kind.admin === segment) ?? null;
}

/* ---------- Public site: published posts only, cached ---------- */

export async function getPublishedPosts(type: PostType): Promise<PostSummary[]> {
  "use cache";
  cacheTag("posts");

  if (!dbConfigured()) {
    cacheLife("minutes");
    return [];
  }
  try {
    const rows = await query<PostSummary>(
      `SELECT ${SUMMARY} FROM posts
       WHERE type = $1 AND status = 'published'
       ORDER BY published_at DESC NULLS LAST, id DESC`,
      [type],
    );
    cacheLife("hours");
    return rows;
  } catch (error) {
    console.error("Posts: the list could not be loaded.", error);
    cacheLife("minutes");
    return [];
  }
}

export async function getPublishedPost(
  type: PostType,
  slug: string,
): Promise<Post | null> {
  "use cache";
  cacheTag("posts");

  // "-" is the stand-in address the build uses when nothing is published yet.
  if (!dbConfigured() || slug === "-") {
    cacheLife("minutes");
    return null;
  }
  // No fallback here, on purpose. "Not found" must mean the post does not
  // exist: if the database is down, the error leaves copies of the page that
  // were built earlier in place and answers the rest with a 5xx, instead of
  // telling visitors and search engines that a real article is gone.
  const [row] = await query<Post>(
    `SELECT ${SUMMARY}, body FROM posts
     WHERE type = $1 AND slug = $2 AND status = 'published'`,
    [type, slug],
  );
  cacheLife("hours");
  return row ?? null;
}

/* ---------- Admin panel: everything, never cached ---------- */

export const POST_PAGE_SIZE = 20;

export async function listPosts(
  type: PostType,
  filter: { status?: PostStatus; search?: string } = {},
  page = 1,
) {
  const values: unknown[] = [type];
  let where = "type = $1";
  if (filter.status) {
    values.push(filter.status);
    where += ` AND status = $${values.length}`;
  }
  if (filter.search) {
    values.push(`%${filter.search.replace(/[%_\\]/g, "\\$&")}%`);
    where += ` AND (title ILIKE $${values.length} OR topic ILIKE $${values.length} OR tags ILIKE $${values.length})`;
  }
  const [rows, [{ count }]] = await Promise.all([
    query<PostSummary>(
      `SELECT ${SUMMARY} FROM posts WHERE ${where} ORDER BY updated_at DESC
       LIMIT ${POST_PAGE_SIZE} OFFSET ${(Math.max(1, page) - 1) * POST_PAGE_SIZE}`,
      values,
    ),
    query<{ count: string }>(`SELECT count(*) FROM posts WHERE ${where}`, values),
  ]);
  return { rows, total: Number(count) };
}

/** For the dashboard: what was touched last, and what went live last. */
export async function recentPosts(order: "updated_at" | "published_at", limit = 6) {
  return query<PostSummary>(
    order === "published_at"
      ? `SELECT ${SUMMARY} FROM posts WHERE status = 'published' ORDER BY published_at DESC NULLS LAST LIMIT $1`
      : `SELECT ${SUMMARY} FROM posts ORDER BY updated_at DESC LIMIT $1`,
    [limit],
  );
}

export async function getPost(id: number) {
  const [row] = await query<Post>(
    `SELECT ${SUMMARY}, body FROM posts WHERE id = $1`,
    [id],
  );
  return row ?? null;
}

export async function countPosts() {
  const rows = await query<{ type: PostType; status: PostStatus; count: string }>(
    "SELECT type, status, count(*) FROM posts GROUP BY type, status",
  );
  const counts = {
    article: { draft: 0, published: 0, unpublished: 0 },
    blog: { draft: 0, published: 0, unpublished: 0 },
  };
  for (const row of rows) counts[row.type][row.status] = Number(row.count);
  return counts;
}

export type PostInput = {
  type: PostType;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  topic: string;
  cover_url: string;
  author: string;
  status: PostStatus;
  tags: string;
  seo_title: string;
  seo_description: string;
  canonical_url: string;
  noindex: boolean;
  og_title: string;
  og_description: string;
  og_image: string;
  og_image_alt: string;
};

/** A web address nobody else of this kind is using: "title", "title-2", ... */
async function freeSlug(type: PostType, wanted: string, ownId: number | null) {
  const base = slugify(wanted) || "untitled";
  const taken = new Set(
    (
      await query<{ slug: string }>(
        "SELECT slug FROM posts WHERE type = $1 AND slug LIKE $2 AND id IS DISTINCT FROM $3",
        [type, `${base}%`, ownId],
      )
    ).map((row) => row.slug),
  );
  if (!taken.has(base)) return base;
  for (let n = 2; ; n += 1) {
    if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
  }
}

/** Creates the post, or updates it when an id is given. Returns its id. */
export async function savePost(id: number | null, input: PostInput) {
  const slug = await freeSlug(input.type, input.slug || input.title, id);
  const columns = {
    title: input.title,
    slug,
    excerpt: input.excerpt,
    body: input.body,
    topic: input.topic,
    cover_url: input.cover_url,
    author: input.author,
    status: input.status,
    tags: splitTags(input.tags).join(", "),
    seo_title: input.seo_title,
    seo_description: input.seo_description,
    canonical_url: input.canonical_url,
    noindex: input.noindex,
    og_title: input.og_title,
    og_description: input.og_description,
    og_image: input.og_image,
    og_image_alt: input.og_image_alt,
  };
  const names = Object.keys(columns);
  const values: unknown[] = Object.values(columns);

  if (id === null) {
    const [row] = await query<{ id: number }>(
      `INSERT INTO posts (${names.join(", ")}, type, published_at)
       VALUES (${names.map((_, i) => `$${i + 1}`).join(", ")}, $${names.length + 1},
               CASE WHEN $${names.length + 2}::text = 'published' THEN now() END)
       RETURNING id`,
      [...values, input.type, input.status],
    );
    return row.id;
  }

  // The first publication date is kept if the post is unpublished and
  // published again, so it does not jump to the top of the list.
  await query(
    `UPDATE posts SET ${names.map((name, i) => `${name} = $${i + 1}`).join(", ")},
       updated_at = now(),
       published_at = CASE WHEN $${names.length + 2}::text = 'published' THEN COALESCE(published_at, now()) ELSE published_at END
     WHERE id = $${names.length + 1}`,
    [...values, id, input.status],
  );
  return id;
}

export async function setPostStatus(id: number, status: PostStatus) {
  await query(
    `UPDATE posts SET status = $2, updated_at = now(),
       published_at = CASE WHEN $2::text = 'published' THEN COALESCE(published_at, now()) ELSE published_at END
     WHERE id = $1`,
    [id, status],
  );
}

export async function deletePost(id: number) {
  await query("DELETE FROM posts WHERE id = $1", [id]);
}
