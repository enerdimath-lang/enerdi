import type { MetadataRoute } from "next";
import { getPublishedPosts, postKinds } from "@/lib/posts";
import { getHiddenPageKeys, seoPages } from "@/lib/seo";

/**
 * The list of pages for search engines: every public page and every published
 * article and blog post, leaving out anything set to "hide from search
 * engines". It updates by itself when content is published.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = (process.env.SITE_URL?.trim() || "http://localhost:3000").replace(/\/+$/, "");
  const [articles, posts, hidden] = await Promise.all([
    getPublishedPosts("article"),
    getPublishedPosts("blog"),
    getHiddenPageKeys(),
  ]);

  return [
    ...seoPages
      .filter((page) => !hidden.includes(page.key))
      .map((page) => ({ url: `${site}${page.path === "/" ? "" : page.path}` })),
    ...[...articles, ...posts]
      .filter((post) => !post.noindex)
      .map((post) => ({
        url: `${site}${postKinds[post.type].path}/${post.slug}`,
        lastModified: new Date(post.updated_at),
      })),
  ];
}
