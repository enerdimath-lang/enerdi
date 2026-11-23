import type { MetadataRoute } from "next";

/** Tells search engines to stay out of the admin panel and where the sitemap is. */
export default function robots(): MetadataRoute.Robots {
  const site = process.env.SITE_URL?.trim().replace(/\/+$/, "");
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }],
    ...(site ? { sitemap: `${site}/sitemap.xml` } : {}),
  };
}
