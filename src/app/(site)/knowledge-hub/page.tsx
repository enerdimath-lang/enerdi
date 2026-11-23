import type { Metadata } from "next";
import { KnowledgeHubView } from "@/components/pages/KnowledgeHubView";
import { getContent } from "@/lib/content";
import { getPublishedPosts } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { knowledgeHub } = await getContent();
  return pageMetadata("knowledge-hub", { title: knowledgeHub.title, description: knowledgeHub.lead });
}

export default async function KnowledgeHubPage() {
  const [content, articles] = await Promise.all([getContent(), getPublishedPosts("article")]);
  return <KnowledgeHubView content={content} articles={articles} />;
}
