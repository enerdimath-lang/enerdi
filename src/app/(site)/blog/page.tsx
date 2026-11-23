import type { Metadata } from "next";
import { BlogView } from "@/components/pages/BlogView";
import { getContent } from "@/lib/content";
import { getPublishedPosts } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { blog } = await getContent();
  return pageMetadata("blog", { title: blog.title, description: blog.lead });
}

export default async function BlogPage() {
  const [content, posts] = await Promise.all([getContent(), getPublishedPosts("blog")]);
  return <BlogView content={content} posts={posts} />;
}
