import type { Metadata } from "next";
import { ServicesView } from "@/components/pages/ServicesView";
import { getPublishedCatalog } from "@/lib/catalog";
import { getContent } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return pageMetadata("services", { title: content.servicesPage.title, description: content.servicesPage.intro });
}

export default async function ServicesPage() {
  const [content, services] = await Promise.all([getContent(), getPublishedCatalog("services")]);
  return <ServicesView content={content} services={services} />;
}
