import { ContactCtaView } from "@/components/ContactCta";
import { PageHero } from "@/components/PageHero";
import { PostCard } from "@/components/PostCard";
import type { SiteContent } from "@/content/sections";
import type { PostSummary } from "@/lib/posts";


/**
 * The page itself, given its content. The public route passes the published
 * content; the admin preview passes the saved draft.
 */
export function BlogView({
  content,
  posts,
}: {
  content: SiteContent;
  posts: PostSummary[];
}) {
  const { blog } = content;
  return (
    <>
      <PageHero eyebrow={blog.title} title={blog.lead} intro={blog.intro} />

      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          {posts.length === 0 ? (
            <p className="flex items-center gap-3 font-mono text-sm tracking-[0.14em] text-muted uppercase">
              <span aria-hidden="true" className="h-2 w-5 bg-sky-brand" />
              {blog.emptyNote}
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} basePath="/blog" />
              ))}
            </div>
          )}
        </div>
      </section>

      <ContactCtaView contact={content.contact} />
    </>
  );
}
