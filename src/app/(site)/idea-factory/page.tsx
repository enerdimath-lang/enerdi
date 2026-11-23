import type { Metadata } from "next";
import { IdeaFactoryView } from "@/components/pages/IdeaFactoryView";
import { getContent } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return pageMetadata("idea-factory", { title: content.ideaFactory.title, description: content.ideaFactory.lead });
}

export default async function IdeaFactoryPage() {
  return <IdeaFactoryView content={await getContent()} />;
}
