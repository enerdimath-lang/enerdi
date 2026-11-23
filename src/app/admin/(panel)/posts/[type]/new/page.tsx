import { notFound } from "next/navigation";
import { PageTitle } from "@/components/admin/PageTitle";
import { PostForm } from "@/components/admin/PostForm";
import { requireAdmin } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { getImageLibrary } from "@/lib/library";
import { kindFromAdminSegment } from "@/lib/posts";
import { emptySeo } from "@/lib/seo";

// Waits for the session check on the server instead of showing a prefetched page.
export const instant = false;

export default async function NewPostPage({
  params,
}: PageProps<"/admin/posts/[type]/new">) {
  const admin = await requireAdmin();
  const kind = kindFromAdminSegment((await params).type);
  if (!kind) notFound();

  const [{ knowledgeHub, blog }, library] = await Promise.all([
    getContent(),
    getImageLibrary(),
  ]);

  return (
    <>
      <PageTitle
        eyebrow={kind.plural}
        title={`New ${kind.singular}`}
        back={{ href: `/admin/posts/${kind.admin}`, label: kind.plural }}
      />
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
        post={{
          id: null,
          title: "",
          slug: "",
          excerpt: "",
          body: "",
          topic: "",
          cover_url: "",
          author: admin.name === "Admin" ? "ENERDI" : admin.name,
          tags: "",
          status: "draft",
          seo: emptySeo,
        }}
      />
    </>
  );
}
