import type { Metadata } from "next";
import { ContactCta } from "@/components/ContactCta";
import { PostView, postMetadata, postStaticParams } from "@/components/PostView";

// The whole page is produced before anything is sent. That is what lets a
// wrong address answer with a true 404 status rather than a 200.
export const ensureStatic = "navigation";
// ...which means a first visit waits for the page rather than showing a
// placeholder, and that is intended.
export const instant = false;

export function generateStaticParams() {
  return postStaticParams("article");
}

export function generateMetadata({
  params,
}: PageProps<"/knowledge-hub/[slug]">): Promise<Metadata> {
  return postMetadata("article", params);
}

export default function Page({ params }: PageProps<"/knowledge-hub/[slug]">) {
  return (
    <>
      <PostView type="article" params={params} />
      <ContactCta />
    </>
  );
}
