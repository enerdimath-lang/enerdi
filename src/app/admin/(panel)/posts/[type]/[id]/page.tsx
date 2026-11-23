import { notFound } from "next/navigation";
import { deletePostAction } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { PageTitle } from "@/components/admin/PageTitle";
import { PostForm } from "@/components/admin/PostForm";
import { requireAdmin } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { getImageLibrary } from "@/lib/library";
import { getPost, kindFromAdminSegment } from "@/lib/posts";

// Waits for the session check on the server instead of showing a prefetched page.
export const instant = false;

export default async function EditPostPage({
  params,
  searchParams,
}: PageProps<"/admin/posts/[type]/[id]">) {
  await requireAdmin();
  const { type, id } = await params;
  const kind = kindFromAdminSegment(type);
  if (!kind || !/^\d{1,9}$/.test(id)) notFound();

  const [post, { knowledgeHub, blog }, library, query] = await Promise.all([
    getPost(Number(id)),
    getContent(),
    getImageLibrary(),
    searchParams,
  ]);
  if (!post || post.type !== kind.type) notFound();

  return (
    <>
      <PageTitle
        eyebrow={kind.plural}
        title={`Edit ${kind.singular}`}
        back={{ href: `/admin/posts/${kind.admin}`, label: kind.plural }}
      >
        <form action={deletePostAction}>
          <input type="hidden" name="id" value={post.id} />
          <ConfirmButton label={`Delete this ${kind.singular}`} />
        </form>
      </PageTitle>
      <PostForm
        kind={{
          type: kind.type,
          singular: kind.singular,
          path: kind.path,
          adminPath: `/admin/posts/${kind.admin}`,
          groupLabel: kind.type === "article" ? "Topic" : "Category",
        }}
        topics={kind.type === "article" ? knowledgeHub.topics : blog.categories}
        library={library}
        savedNotice={typeof query.saved === "string" ? query.saved : undefined}
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          body: post.body,
          topic: post.topic,
          cover_url: post.cover_url,
          author: post.author,
          tags: post.tags,
          status: post.status,
          seo: {
            title: post.seo_title,
            description: post.seo_description,
            canonical_url: post.canonical_url,
            noindex: post.noindex,
            og_title: post.og_title,
            og_description: post.og_description,
            og_image: post.og_image,
            og_image_alt: post.og_image_alt,
          },
        }}
      />
    </>
  );
}
