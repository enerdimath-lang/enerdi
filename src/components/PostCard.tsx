import Link from "next/link";
import type { PostSummary } from "@/lib/posts";

export function formatDate(date: Date | string | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(date));
}

/** One article or blog post in a list. */
export function PostCard({ post, basePath }: { post: PostSummary; basePath: string }) {
  return (
    <article className="group relative flex flex-col border border-line bg-white transition-colors hover:border-navy-800">
      {post.cover_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_url}
          alt=""
          loading="lazy"
          className="aspect-[16/9] w-full bg-paper object-cover"
        />
      ) : (
        <div aria-hidden="true" className="flex aspect-[16/9] w-full flex-col justify-center gap-2 bg-navy-900 px-8">
          <span className="h-3 w-2/3 bg-sky-brand" />
          <span className="h-3 w-1/2 bg-sky-brand/70" />
          <span className="h-3 w-1/3 bg-sky-brand/40" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-7">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs tracking-[0.14em] text-muted uppercase">
          {post.topic && <span className="text-navy-700">{post.topic}</span>}
          <time dateTime={post.published_at ? new Date(post.published_at).toISOString() : undefined}>
            {formatDate(post.published_at)}
          </time>
        </p>
        <h3 className="mt-3 text-2xl leading-tight font-extrabold text-navy-800">
          <Link href={`${basePath}/${post.slug}`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && (
          <p className="mt-3 leading-relaxed text-muted">{post.excerpt}</p>
        )}
        <p className="mt-auto pt-6 font-semibold text-navy-800 underline decoration-sky-brand decoration-2 underline-offset-[6px]">
          Read <span aria-hidden="true">→</span>
        </p>
      </div>
    </article>
  );
}
