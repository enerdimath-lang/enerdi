import Link from "next/link";
import { param, StatusBadge } from "@/components/admin/bits";
import { PageTitle } from "@/components/admin/PageTitle";
import { ui } from "@/components/admin/ui";
import { contentPages } from "@/content/sections";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import type { EnquiryStatus } from "@/lib/enquiries";
import { postKinds, type PostStatus, type PostType } from "@/lib/posts";

// Waits for the session check on the server instead of showing a prefetched page.
export const instant = false;

type Hit = { href: string; title: string; kind: string; status?: PostStatus | EnquiryStatus };

async function search(term: string): Promise<Hit[]> {
  const like = `%${term.replace(/[%_\\]/g, "\\$&")}%`;
  const [posts, products, services, enquiries] = await Promise.all([
    query<{ id: number; type: PostType; title: string; status: PostStatus }>(
      `SELECT id, type, title, status FROM posts
       WHERE title ILIKE $1 OR excerpt ILIKE $1 OR body ILIKE $1 OR topic ILIKE $1 OR tags ILIKE $1
       ORDER BY updated_at DESC LIMIT 20`,
      [like],
    ),
    query<{ id: number; name: string; status: PostStatus }>(
      "SELECT id, name, status FROM products WHERE name ILIKE $1 OR full_name ILIKE $1 OR description ILIKE $1 OR category ILIKE $1 ORDER BY position LIMIT 10",
      [like],
    ),
    query<{ id: number; name: string; status: PostStatus }>(
      "SELECT id, name, status FROM services WHERE name ILIKE $1 OR full_name ILIKE $1 OR description ILIKE $1 OR category ILIKE $1 ORDER BY position LIMIT 10",
      [like],
    ),
    query<{ id: number; name: string; email: string; status: EnquiryStatus }>(
      `SELECT id, name, email, status FROM contact_enquiries
       WHERE name ILIKE $1 OR email ILIKE $1 OR company ILIKE $1 OR message ILIKE $1
       ORDER BY created_at DESC LIMIT 10`,
      [like],
    ),
  ]);

  const lower = term.toLowerCase();
  return [
    ...contentPages
      .filter((page) => page.label.toLowerCase().includes(lower))
      .map((page) => ({ href: `/admin/content/${page.slug}`, title: `${page.label} page text`, kind: "Website Content" })),
    ...posts.map((post) => ({
      href: `/admin/posts/${postKinds[post.type].admin}/${post.id}`,
      title: post.title,
      kind: post.type === "article" ? "Article" : "Blog post",
      status: post.status,
    })),
    ...products.map((item) => ({ href: `/admin/catalog/products/${item.id}`, title: item.name, kind: "Product", status: item.status })),
    ...services.map((item) => ({ href: `/admin/catalog/services/${item.id}`, title: item.name, kind: "Service", status: item.status })),
    ...enquiries.map((item) => ({
      href: `/admin/enquiries?q=${encodeURIComponent(item.email)}`,
      title: `${item.name} (${item.email})`,
      kind: "Enquiry",
      status: item.status,
    })),
  ];
}

export default async function SearchPage({ searchParams }: PageProps<"/admin/search">) {
  await requireAdmin();
  const term = param((await searchParams).q);
  const hits = term.length >= 2 ? await search(term) : [];

  return (
    <>
      <PageTitle
        eyebrow="Search"
        title={term ? `Results for "${term}"` : "Search"}
        intro="Searches articles, blog posts, products, services, page names and enquiries."
      />
      {term.length < 2 ? (
        <p className="text-muted">Type at least two letters in the search box at the top.</p>
      ) : hits.length === 0 ? (
        <div className={`${ui.card} p-10 text-center text-lg text-muted`}>Nothing found.</div>
      ) : (
        <ul className={ui.card}>
          {hits.map((hit) => (
            <li key={`${hit.kind}-${hit.href}`} className="border-b border-line last:border-b-0">
              <Link href={hit.href} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5 hover:bg-paper">
                <span className="w-32 shrink-0 font-mono text-xs tracking-[0.12em] text-muted uppercase">{hit.kind}</span>
                <span className="min-w-0 flex-1 truncate font-semibold text-navy-800">{hit.title}</span>
                {hit.status && <StatusBadge status={hit.status} />}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
