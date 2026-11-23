import { notFound } from "next/navigation";
import { PageTitle } from "@/components/admin/PageTitle";
import { SeoForm } from "@/components/admin/SeoForm";
import { requireAdmin } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { getImageLibrary } from "@/lib/library";
import { emptySeo, getSeoForEditing, isSeoPageKey, seoPages, type SeoPageKey } from "@/lib/seo";

// Waits for the session check on the server instead of showing a prefetched page.
export const instant = false;

/** What each page shows when its SEO fields are left empty. */
async function fallbacks(key: SeoPageKey) {
  const content = await getContent();
  const map: Record<SeoPageKey, { title: string; description: string }> = {
    home: { title: `${content.site.name} | ${content.site.meaning.join(", ")}`, description: content.site.description },
    about: { title: content.about.title, description: content.about.lead },
    products: { title: content.productsPage.title, description: content.productsPage.intro },
    services: { title: content.servicesPage.title, description: content.servicesPage.intro },
    "knowledge-hub": { title: content.knowledgeHub.title, description: content.knowledgeHub.lead },
    blog: { title: content.blog.title, description: content.blog.lead },
    "idea-factory": { title: content.ideaFactory.title, description: content.ideaFactory.lead },
    contact: { title: content.contact.title, description: content.contact.lead },
  };
  return map[key];
}

export default async function SeoEditPage({ params }: PageProps<"/admin/seo/[key]">) {
  await requireAdmin();
  const { key } = await params;
  if (!isSeoPageKey(key)) notFound();
  const page = seoPages.find((item) => item.key === key)!;

  const [saved, fallback, library] = await Promise.all([
    getSeoForEditing(),
    fallbacks(key),
    getImageLibrary(),
  ]);

  return (
    <>
      <PageTitle
        eyebrow="SEO Management"
        title={`${page.label} page`}
        intro={`The address of this page is ${page.path}. It is part of the website's structure and cannot be changed here.`}
        back={{ href: "/admin/seo", label: "All pages" }}
      />
      <SeoForm
        pageKey={key}
        initial={saved[key] ?? emptySeo}
        fallbackTitle={fallback.title}
        fallbackDescription={fallback.description}
        library={library}
      />
    </>
  );
}
