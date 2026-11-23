import Link from "next/link";
import { formatDateTime, StatusBadge } from "@/components/admin/bits";
import { PageTitle } from "@/components/admin/PageTitle";
import { ui } from "@/components/admin/ui";
import { listActivity } from "@/lib/activity";
import { requireAdmin } from "@/lib/auth";
import { countCatalog } from "@/lib/catalog";
import { countEnquiries } from "@/lib/enquiries";
import { countPosts, postKinds, recentPosts, type PostSummary } from "@/lib/posts";

// Waits for the session check on the server instead of showing a prefetched page.
export const instant = false;

function Stat({ label, value, href, note }: { label: string; value: number; href: string; note?: string }) {
  return (
    <Link href={href} className={`${ui.card} block border-t-[5px] border-t-sky-brand p-5 transition-colors hover:border-navy-800`}>
      <span className="block font-display text-4xl font-extrabold text-navy-800">{value}</span>
      <span className="mt-1 block font-mono text-xs tracking-[0.14em] text-muted uppercase">{label}</span>
      {note && <span className="mt-2 block text-sm text-muted">{note}</span>}
    </Link>
  );
}

function PostList({ title, posts, date }: { title: string; posts: PostSummary[]; date: "updated_at" | "published_at" }) {
  return (
    <section className={ui.card}>
      <h2 className="border-b border-line px-5 py-4 text-lg font-extrabold text-navy-800">{title}</h2>
      {posts.length === 0 ? (
        <p className="px-5 py-5 text-muted">Nothing yet.</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line px-5 py-3 last:border-b-0">
              <Link
                href={`/admin/posts/${postKinds[post.type].admin}/${post.id}`}
                className="min-w-0 flex-1 truncate font-semibold text-navy-800 hover:underline"
              >
                {post.title}
              </Link>
              <StatusBadge status={post.status} />
              <span className="w-full text-sm text-muted sm:w-auto">
                {post.type === "article" ? "Article" : "Blog"} · {formatDateTime(post[date])}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function DashboardPage() {
  const admin = await requireAdmin();
  const [posts, products, services, enquiries, updated, published, activity] = await Promise.all([
    countPosts(),
    countCatalog("products"),
    countCatalog("services"),
    countEnquiries(),
    recentPosts("updated_at"),
    recentPosts("published_at"),
    listActivity(1, 8),
  ]);
  const blogTotal = posts.blog.published + posts.blog.draft + posts.blog.unpublished;

  return (
    <>
      <PageTitle
        eyebrow="Dashboard"
        title={`Welcome, ${admin.name || admin.email}.`}
        intro="Everything on the public website is managed from here."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Stat label="Published articles" value={posts.article.published} href="/admin/posts/articles?status=published" />
        <Stat label="Draft articles" value={posts.article.draft} href="/admin/posts/articles?status=draft" />
        <Stat label="Blog posts" value={blogTotal} href="/admin/posts/blog" note={`${posts.blog.published} published`} />
        <Stat label="Products" value={products.total} href="/admin/catalog/products" note={`${products.published} published`} />
        <Stat label="Services" value={services.total} href="/admin/catalog/services" note={`${services.published} published`} />
        <Stat label="Contact enquiries" value={enquiries.total} href="/admin/enquiries" note={`${enquiries.fresh} new`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <PostList title="Recently updated" posts={updated} date="updated_at" />
        <PostList title="Recently published" posts={published} date="published_at" />
      </div>

      <section className={`${ui.card} mt-6`}>
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 className="text-lg font-extrabold text-navy-800">Recent admin activity</h2>
          <Link href="/admin/activity" className="text-sm font-semibold text-navy-800 underline decoration-sky-brand decoration-2 underline-offset-4">
            See all
          </Link>
        </div>
        {activity.rows.length === 0 ? (
          <p className="px-5 py-5 text-muted">No activity yet.</p>
        ) : (
          <ul>
            {activity.rows.map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-line px-5 py-3 last:border-b-0">
                <span className="text-[0.95rem] text-ink">
                  <span className="font-semibold text-navy-800">{entry.action}</span>
                  {entry.entity && ` · ${entry.entity}`}
                  {entry.detail && `: ${entry.detail}`}
                </span>
                <span className="text-sm text-muted">
                  {entry.admin_email || "Unknown"} · {formatDateTime(entry.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
