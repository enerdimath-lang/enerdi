import type { Metadata } from "next";
import { HomeView } from "@/components/pages/HomeView";
import { getPublishedCatalog } from "@/lib/catalog";
import { getContent } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getContent();
  return pageMetadata("home", {
    title: `${site.name} | ${site.meaning.join(", ")}`,
    description: site.description,
  });
}

export default async function HomePage() {
  const [content, products, services] = await Promise.all([
    getContent(),
    getPublishedCatalog("products"),
    getPublishedCatalog("services"),
  ]);
  return <HomeView content={content} products={products} services={services} />;
}
