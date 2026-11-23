import Link from "next/link";
import { notFound } from "next/navigation";
import { deletePostAction, setPostStatusAction } from "@/app/admin/actions";
import {
  FilterBar,
  formatDateTime,
  pageNumber,
  Pagination,
  param,
  publishStatuses,
  StatusBadge,
} from "@/components/admin/bits";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { PageTitle } from "@/components/admin/PageTitle";
import { ui } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { kindFromAdminSegment, listPosts, POST_PAGE_SIZE, type PostStatus } from "@/lib/posts";

// Waits for the session check on the server instead of showing a prefetched page.
export const instant = false;

export default async function PostsPage({
  params,
  searchParams,
}: PageProps<"/admin/posts/[type]">) {
  await requireAdmin();
  const kind = kindFromAdminSegment((await params).type);
  if (!kind) notFound();

  const query = await searchParams;
  const search = param(query.q);
  const statusParam = param(query.status);
  const status = publishStatuses.some((item) => item.value === statusParam)
    ? (statusParam as PostStatus)
    : undefined;
  const page = pageNumber(query.page);
  const { rows: posts, total } = await listPosts(kind.type, { status, search }, page);
  const base = `/admin/posts/${kind.admin}`;
  const filtered = Boolean(search || status);

  return (
    <>
      <PageTitle
        eyebrow="Management"
        title={kind.plural}
        intro={`Drafts and unpublished ones are only visible here. Published ones appear on the website at ${kind.path}.`}
      >
        <Link href={`${base}/new`} className={ui.primary}>
          Write a new {kind.singular}
        </Link>
      </PageTitle>

      <FilterBar search={search} status={status ?? ""} statuses={publishStatuses} placeholder="Title, topic or tag" />

      {posts.length === 0 ? (
        <div className={`${ui.card} p-10 text-center`}>
          <p className="text-lg text-muted">
            {filtered ? "Nothing matches that search." : "Nothing here yet."}
          </p>
          {!filtered && (
            <p className="mt-5">
              <Link href={`${base}/new`} className={ui.primary}>
                Write the first {kind.singular}
              </Link>
            </p>
          )}
        </div>
      ) : (
        <div className={`${ui.card} overflow-x-auto`}>
          <table className="w-full min-w-[44rem] text-left text-[0.95rem]">
            <thead className="border-b border-line bg-paper font-mono text-xs tracking-[0.12em] text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">{kind.type === "article" ? "Topic" : "Category"}</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const live = post.status === "published";
                return (
                  <tr key={post.id} className="border-b border-line align-top last:border-b-0">
                    <td className="max-w-xs px-4 py-3">
                      <Link href={`${base}/${post.id}`} className="font-semibold text-navy-800 hover:underline">
                        {post.title}
                      </Link>
                      {post.noindex && (
                        <span className="mt-1 block font-mono text-xs text-red-700">Hidden from search engines</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-4 py-3 text-muted">{post.topic || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted">{formatDateTime(post.updated_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`${base}/${post.id}`} className={ui.small}>
                          Edit
                        </Link>
                        <Link href={`${base}/${post.id}/preview`} target="_blank" className={ui.small}>
                          Preview
                        </Link>
                        <form action={setPostStatusAction}>
                          <input type="hidden" name="id" value={post.id} />
                          <input type="hidden" name="status" value={live ? "unpublished" : "published"} />
                          <button type="submit" className={ui.small}>
                            {live ? "Unpublish" : "Publish"}
                          </button>
                        </form>
                        <form action={deletePostAction}>
                          <input type="hidden" name="id" value={post.id} />
                          <ConfirmButton question="Delete for good?" />
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={page}
        total={total}
        pageSize={POST_PAGE_SIZE}
        href={(n) => `${base}?${new URLSearchParams({ q: search, status: status ?? "", page: String(n) })}`}
      />
    </>
  );
}
