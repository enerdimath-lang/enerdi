import Link from "next/link";
import { notFound } from "next/navigation";
import { param } from "@/components/admin/bits";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { PageTitle } from "@/components/admin/PageTitle";
import { ui } from "@/components/admin/ui";
import { contentPages, defaults, sections } from "@/content/sections";
import { requireAdmin } from "@/lib/auth";
import { getSectionForEditing } from "@/lib/content";
import { getImageLibrary } from "@/lib/library";

// Waits for the session check on the server instead of showing a prefetched page.
export const instant = false;

const related: Record<string, { href: string; label: string }[]> = {
  home: [{ href: "/admin/seo/home", label: "SEO for this page" }],
  about: [{ href: "/admin/seo/about", label: "SEO for this page" }],
  products: [
    { href: "/admin/catalog/products", label: "Manage the products" },
    { href: "/admin/seo/products", label: "SEO for this page" },
  ],
  services: [
    { href: "/admin/catalog/services", label: "Manage the services" },
    { href: "/admin/seo/services", label: "SEO for this page" },
  ],
  "knowledge-hub": [
    { href: "/admin/posts/articles", label: "Manage the articles" },
    { href: "/admin/seo/knowledge-hub", label: "SEO for this page" },
  ],
  blog: [
    { href: "/admin/posts/blog", label: "Manage the blog posts" },
    { href: "/admin/seo/blog", label: "SEO for this page" },
  ],
  "idea-factory": [{ href: "/admin/seo/idea-factory", label: "SEO for this page" }],
  contact: [
    { href: "/admin/enquiries", label: "See the enquiries" },
    { href: "/admin/seo/contact", label: "SEO for this page" },
  ],
  footer: [{ href: "/admin/navigation?menu=footer", label: "Manage the footer menu" }],
};

export default async function ContentPage({
  params,
  searchParams,
}: PageProps<"/admin/content/[page]">) {
  await requireAdmin();
  const { page: slug } = await params;
  const page = contentPages.find((item) => item.slug === slug);
  if (!page) notFound();

  const [states, library, query] = await Promise.all([
    Promise.all(page.sections.map((key) => getSectionForEditing(key))),
    getImageLibrary(),
    searchParams,
  ]);
  const resetAt = param(query.reset);

  return (
    <>
      <PageTitle
        eyebrow="Website Content"
        title={page.label}
        intro="Change the text, save it as a draft and preview it, then press Publish. Nothing shows on the website until you publish it."
      >
        <div className="flex flex-wrap gap-2">
          {(related[page.slug] ?? []).map((link) => (
            <Link key={link.href} href={link.href} className={ui.small}>
              {link.label}
            </Link>
          ))}
          <Link href={page.path} target="_blank" className={ui.small}>
            View the page ↗
          </Link>
        </div>
      </PageTitle>

      {resetAt && (
        <p role="status" className="mb-6 border-l-[6px] border-emerald-600 bg-emerald-50 px-4 py-3 font-medium text-emerald-900">
          Back to the original text. The website shows it now.
        </p>
      )}

      <div className="grid gap-10">
        {page.sections.map((key, index) => (
          <section key={key}>
            <h2 className="text-xl font-extrabold text-navy-800">{sections[key].label}</h2>
            <p className="mt-1 mb-4 text-muted">{sections[key].note}</p>
            <ContentEditor
              // A reset reloads the form with the original text.
              key={resetAt}
              sectionKey={key}
              returnTo={`/admin/content/${page.slug}`}
              previewHref={`/admin/preview/${page.slug}`}
              template={defaults[key]}
              initial={states[index].working}
              hasDraft={states[index].hasDraft}
              isCustomised={states[index].isCustomised}
              library={library}
            />
          </section>
        ))}
      </div>
    </>
  );
}
