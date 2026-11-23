import "server-only";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { dbConfigured, query } from "./db";

/** The public pages whose search-engine settings the admin can manage. */
export const seoPages = [
  { key: "home", label: "Home", path: "/" },
  { key: "about", label: "About", path: "/about" },
  { key: "products", label: "Products", path: "/products" },
  { key: "services", label: "Services", path: "/services" },
  { key: "knowledge-hub", label: "Knowledge Hub", path: "/knowledge-hub" },
  { key: "blog", label: "Blog", path: "/blog" },
  { key: "idea-factory", label: "The Idea Factory", path: "/idea-factory" },
  { key: "contact", label: "Contact", path: "/contact" },
] as const;

export type SeoPageKey = (typeof seoPages)[number]["key"];

export function isSeoPageKey(value: string): value is SeoPageKey {
  return seoPages.some((page) => page.key === value);
}

export type Seo = {
  title: string;
  description: string;
  canonical_url: string;
  noindex: boolean;
  og_title: string;
  og_description: string;
  og_image: string;
  og_image_alt: string;
};

export const emptySeo: Seo = {
  title: "",
  description: "",
  canonical_url: "",
  noindex: false,
  og_title: "",
  og_description: "",
  og_image: "",
  og_image_alt: "",
};

const COLUMNS =
  "title, description, canonical_url, noindex, og_title, og_description, og_image, og_image_alt";

async function getAllSeo(): Promise<Record<string, Seo>> {
  "use cache";
  cacheTag("seo");

  if (!dbConfigured()) {
    cacheLife("minutes");
    return {};
  }
  try {
    const rows = await query<Seo & { page_key: string }>(
      `SELECT page_key, ${COLUMNS} FROM seo_metadata`,
    );
    cacheLife("hours");
    return Object.fromEntries(rows.map(({ page_key, ...seo }) => [page_key, seo]));
  } catch (error) {
    console.error("SEO: the settings could not be loaded.", error);
    cacheLife("minutes");
    return {};
  }
}

/**
 * Turns SEO settings into what Next.js puts in the page's <head>.
 * Anything left empty falls back to the page's own title and summary.
 */
export function toMetadata(
  seo: Seo,
  fallback: { title: string; description?: string; path: string; image?: string; article?: boolean },
): Metadata {
  const description = seo.description || fallback.description || undefined;
  const image = seo.og_image || fallback.image;
  return {
    // "absolute" stops the site name being added to a title the admin wrote in full.
    title: seo.title ? { absolute: seo.title } : fallback.title,
    description,
    alternates: { canonical: seo.canonical_url || fallback.path },
    robots: seo.noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: seo.og_title || seo.title || fallback.title,
      description: seo.og_description || description,
      type: fallback.article ? "article" : "website",
      url: seo.canonical_url || fallback.path,
      ...(image ? { images: [{ url: image, alt: seo.og_image_alt || undefined }] } : {}),
    },
  };
}

/** For a page's `generateMetadata`. */
export async function pageMetadata(
  key: SeoPageKey,
  fallback: { title: string; description?: string },
): Promise<Metadata> {
  const all = await getAllSeo();
  const page = seoPages.find((item) => item.key === key)!;
  return toMetadata(all[key] ?? emptySeo, { ...fallback, path: page.path });
}

/** The pages set to "hide from search engines", for the sitemap. */
export async function getHiddenPageKeys() {
  const all = await getAllSeo();
  return Object.keys(all).filter((key) => all[key].noindex);
}

/* ---------- Admin panel ---------- */

export async function getSeoForEditing() {
  const rows = await query<Seo & { page_key: string }>(
    `SELECT page_key, ${COLUMNS} FROM seo_metadata`,
  );
  return Object.fromEntries(rows.map(({ page_key, ...seo }) => [page_key, seo])) as Record<
    string,
    Seo
  >;
}

export async function saveSeo(key: SeoPageKey, seo: Seo) {
  await query(
    `INSERT INTO seo_metadata (page_key, ${COLUMNS}, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())
     ON CONFLICT (page_key) DO UPDATE SET
       title = $2, description = $3, canonical_url = $4, noindex = $5,
       og_title = $6, og_description = $7, og_image = $8, og_image_alt = $9, updated_at = now()`,
    [
      key,
      seo.title,
      seo.description,
      seo.canonical_url,
      seo.noindex,
      seo.og_title,
      seo.og_description,
      seo.og_image,
      seo.og_image_alt,
    ],
  );
}
