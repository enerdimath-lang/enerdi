import type { Metadata } from "next";
import { ContactView } from "@/components/pages/ContactView";
import { getContent } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return pageMetadata("contact", { title: content.contact.title, description: content.contact.lead });
}

export default async function ContactPage() {
  return <ContactView content={await getContent()} />;
}
