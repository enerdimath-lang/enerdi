import Link from "next/link";
import { PageTitle } from "@/components/admin/PageTitle";
import { ui } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import { postKinds, type PostType } from "@/lib/posts";
import { getSeoForEditing, seoPages } from "@/lib/seo";

// Waits for the session check on the server instead of showing a prefetched page.
export const instant = false;

export default async function SeoPage() {
  await requireAdmin();
  const [saved, hidden] = await Promise.all([
    getSeoForEditing(),
    query<{ id: number; type: PostType; title: string }>(
      "SELECT id, type, title FROM posts WHERE noindex AND status = 'published' ORDER BY title",
    ),
  ]);
  const hiddenPages = seoPages.filter((page) => saved[page.key]?.noindex);

  return (
    <>
      <PageTitle
        eyebrow="Search engines"
        title="SEO Management"
        intro="How each page appears in Google and when shared on social media. Articles and blog posts have their own SEO settings in their editor."
      />

      {(hiddenPages.length > 0 || hidden.length > 0) && (
        <div role="alert" className="mb-6 border-l-[6px] border-red-600 bg-red-50 px-5 py-4 text-red-900">
          <p className="font-semibold">These published pages are hidden from search engines:</p>
          <ul className="mt-2 grid gap-1">
            {hiddenPages.map((page) => (
              <li key={page.key}>
                <Link href={`/admin/seo/${page.key}`} className="underline underline-offset-4">
                  {page.label} page
                </Link>
              </li>
            ))}
            {hidden.map((post) => (
              <li key={post.id}>
                <Link href={`/admin/posts/${postKinds[post.type].admin}/${post.id}`} className="underline underline-offset-4">
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={`${ui.card} overflow-x-auto`}>
        <table className="w-full min-w-[40rem] text-left text-[0.95rem]">
          <thead className="border-b border-line bg-paper font-mono text-xs tracking-[0.12em] text-muted uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Page</th>
              <th className="px-4 py-3 font-medium">SEO title</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Search engines</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {seoPages.map((page) => {
              const seo = saved[page.key];
              return (
                <tr key={page.key} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-navy-800">{page.label}</span>
                    <span className="block font-mono text-xs text-muted">{page.path}</span>
                  </td>
                  <td className="max-w-52 truncate px-4 py-3 text-muted">{seo?.title || "Uses the page title"}</td>
                  <td className="px-4 py-3 text-muted">{seo?.description ? "Set" : "Uses the page summary"}</td>
                  <td className="px-4 py-3">
                    {seo?.noindex ? (
                      <span className="font-semibold text-red-700">Hidden</span>
                    ) : (
                      <span className="text-emerald-800">Visible</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/seo/${page.key}`} className={ui.small}>
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
