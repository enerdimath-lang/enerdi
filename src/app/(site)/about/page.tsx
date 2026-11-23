import type { Metadata } from "next";
import { AboutView } from "@/components/pages/AboutView";
import { getContent } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return pageMetadata("about", { title: content.about.title, description: content.about.lead });
}

export default async function AboutPage() {
  return <AboutView content={await getContent()} />;
}
