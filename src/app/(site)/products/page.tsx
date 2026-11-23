import type { Metadata } from "next";
import { ProductsView } from "@/components/pages/ProductsView";
import { getPublishedCatalog } from "@/lib/catalog";
import { getContent } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return pageMetadata("products", { title: content.productsPage.title, description: content.productsPage.intro });
}

export default async function ProductsPage() {
  const [content, products] = await Promise.all([getContent(), getPublishedCatalog("products")]);
  return <ProductsView content={content} products={products} />;
}
