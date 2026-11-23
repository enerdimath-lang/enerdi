import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPost, getPublishedPosts, postKinds, splitTags, type Post, type PostType } from "@/lib/posts";
import { toMetadata } from "@/lib/seo";
import { Markdown } from "./Markdown";
import { formatDate } from "./PostCard";

/**
 * The addresses to build ahead of time: every published post. Any other
 * address is rendered when it is first asked for, and answers with a real
 * "404 Not Found" when no published post has it.
 */
export async function postStaticParams(type: PostType) {
  const posts = await getPublishedPosts(type);
  // The build needs at least one address to check the page with. With
  // nothing published yet, this one stands in and renders the 404 page.
  return posts.length > 0 ? posts.map((post) => ({ slug: post.slug })) : [{ slug: "-" }];
}

/** The full page for one published article or blog post. */
export async function PostView({
  type,
  params,
}: {
  type: PostType;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPost(type, slug);
  if (!post) notFound();
  return <PostArticle post={post} />;
}

/** The article itself. Also used by the admin preview, which is why it takes the post directly. */
export function PostArticle({ post }: { post: Post }) {
  const kind = postKinds[post.type];
  const backLabel = post.type === "article" ? "Knowledge Hub" : "Blog";
  const tags = splitTags(post.tags);

  return (
    <article>
      <header className="bg-navy-800 text-white">
        <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
          <p className="font-mono text-xs tracking-[0.18em] text-sky-soft uppercase">
            <Link href={kind.path} className="hover:text-white">
              <span aria-hidden="true">←</span> {backLabel}
            </Link>
            {post.topic && <span className="text-white/60"> / {post.topic}</span>}
          </p>
          <h1 className="mt-5 text-4xl leading-[1.05] font-extrabold sm:text-5xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-5 text-xl leading-relaxed text-white/80">{post.excerpt}</p>
          )}
          <p className="mt-7 font-mono text-xs tracking-[0.14em] text-white/60 uppercase">
            {[post.author, formatDate(post.published_at)].filter(Boolean).join(" · ")}
          </p>
        </div>
      </header>

      <div className="bg-white">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-16">
          {post.cover_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.cover_url}
              alt=""
              className="mb-12 aspect-[16/9] w-full bg-paper object-cover"
            />
          )}
          <Markdown source={post.body} />
          {tags.length > 0 && (
            <ul className="mt-12 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-md border border-line px-4 py-1.5 font-mono text-xs tracking-[0.1em] text-muted uppercase"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-14 border-t border-line pt-8">
            <Link
              href={kind.path}
              className="font-semibold text-navy-800 underline decoration-sky-brand decoration-2 underline-offset-[6px] hover:text-navy-700"
            >
              <span aria-hidden="true">←</span> Back to {backLabel}
            </Link>
          </p>
        </div>
      </div>
    </article>
  );
}

/** Title, description and social preview, from the post's own SEO settings. */
export async function postMetadata(
  type: PostType,
  params: Promise<{ slug: string }>,
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(type, slug);
  if (!post) return { title: "Not found", robots: { index: false, follow: false } };
  return toMetadata(
    { ...post, title: post.seo_title, description: post.seo_description },
    {
      title: post.title,
      description: post.excerpt,
      path: `${postKinds[type].path}/${post.slug}`,
      image: post.cover_url,
      article: true,
    },
  );
}
