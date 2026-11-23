import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/admin/bits";
import { PostArticle } from "@/components/PostView";
import { requireAdmin } from "@/lib/auth";
import { getPost, kindFromAdminSegment } from "@/lib/posts";

// Waits for the session check on the server instead of showing a prefetched page.
export const instant = false;

/**
 * Shows an article or blog post exactly as visitors would see it, whatever
 * its state. Only signed-in admins can open this address.
 */
export default async function PreviewPage({
  params,
}: PageProps<"/admin/posts/[type]/[id]/preview">) {
  await requireAdmin();
  const { type, id } = await params;
  const kind = kindFromAdminSegment(type);
  if (!kind || !/^\d{1,9}$/.test(id)) notFound();
  const post = await getPost(Number(id));
  if (!post || post.type !== kind.type) notFound();

  return (
    <div className="-mx-4 -my-7 sm:-mx-6 lg:-mx-8 lg:-my-9">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-300 bg-amber-50 px-5 py-3">
        <p className="flex flex-wrap items-center gap-3 text-[0.95rem] font-medium text-amber-900">
          <StatusBadge status={post.status} />
          Preview. {post.status === "published" ? "This is live." : "Visitors cannot see this yet."}
        </p>
        <Link
          href={`/admin/posts/${kind.admin}/${post.id}`}
          className="text-sm font-semibold text-navy-800 underline decoration-sky-brand decoration-2 underline-offset-4"
        >
          ← Back to editing
        </Link>
      </div>
      <PostArticle post={post} />
    </div>
  );
}
