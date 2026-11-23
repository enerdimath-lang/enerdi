import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FooterView } from "@/components/Footer";
import { Header } from "@/components/Header";
import { AboutView } from "@/components/pages/AboutView";
import { BlogView } from "@/components/pages/BlogView";
import { ContactView } from "@/components/pages/ContactView";
import { HomeView } from "@/components/pages/HomeView";
import { IdeaFactoryView } from "@/components/pages/IdeaFactoryView";
import { KnowledgeHubView } from "@/components/pages/KnowledgeHubView";
import { ProductsView } from "@/components/pages/ProductsView";
import { ServicesView } from "@/components/pages/ServicesView";
import { contentPages } from "@/content/sections";
import { requireAdmin } from "@/lib/auth";
import { getPublishedCatalog } from "@/lib/catalog";
import { getDraftContent } from "@/lib/content";
import { getMenu } from "@/lib/navigation";
import { getPublishedPosts } from "@/lib/posts";

export const metadata: Metadata = { title: "Preview" };

// Waits for the session check on the server instead of showing a prefetched page.
export const instant = false;

/**
 * Shows a public page with the saved drafts of its text in place of what is
 * live, so the admin can check a change before publishing it. Only signed-in
 * admins can open this address; visitors are sent to the login page.
 */
async function Preview({ params }: { params: Promise<{ page: string }> }) {
  await requireAdmin();
  const { page: slug } = await params;
  const page = contentPages.find((item) => item.slug === slug);
  if (!page) notFound();

  const [content, products, services, articles, posts, footerMenu] = await Promise.all([
    getDraftContent(),
    getPublishedCatalog("products"),
    getPublishedCatalog("services"),
    getPublishedPosts("article"),
    getPublishedPosts("blog"),
    getMenu("footer"),
  ]);

  const views: Record<string, React.ReactNode> = {
    home: <HomeView content={content} products={products} services={services} />,
    about: <AboutView content={content} />,
    products: <ProductsView content={content} products={products} />,
    services: <ServicesView content={content} services={services} />,
    "knowledge-hub": <KnowledgeHubView content={content} articles={articles} />,
    blog: <BlogView content={content} posts={posts} />,
    "idea-factory": <IdeaFactoryView content={content} />,
    contact: <ContactView content={content} />,
    // The footer is on every page; the home page is as good a place as any to see it.
    footer: <HomeView content={content} products={products} services={services} />,
  };

  return (
    <>
      <div className="sticky top-0 z-[70] flex flex-wrap items-center justify-between gap-3 border-b border-amber-300 bg-amber-50 px-5 py-2.5">
        <p className="text-[0.95rem] font-medium text-amber-900">
          <span className="mr-3 bg-amber-200 px-2 py-1 font-mono text-xs tracking-[0.12em] uppercase">
            Draft preview
          </span>
          {page.label}: this is how the page looks with your saved drafts. Visitors still see the published version.
        </p>
        <Link
          href={`/admin/content/${page.slug}`}
          className="text-sm font-semibold text-navy-800 underline decoration-sky-brand decoration-2 underline-offset-4"
        >
          ← Back to editing
        </Link>
      </div>
      <div className="flex flex-1 flex-col bg-white [&>header]:top-[2.9rem]">
        <Header />
        <main id="main" className="flex-1">
          {views[page.slug]}
        </main>
        <FooterView site={content.site} footer={content.footer} menu={footerMenu} />
      </div>
    </>
  );
}

export default function PreviewPage({ params }: PageProps<"/admin/preview/[page]">) {
  return (
    <Suspense fallback={<p className="p-10 text-muted">Loading the preview…</p>}>
      <Preview params={params} />
    </Suspense>
  );
}
