import Link from "next/link";
import { ContactCtaView } from "@/components/ContactCta";
import { PageHero } from "@/components/PageHero";
import { PostCard } from "@/components/PostCard";
import type { SiteContent } from "@/content/sections";
import type { PostSummary } from "@/lib/posts";


/**
 * The page itself, given its content. The public route passes the published
 * content; the admin preview passes the saved draft.
 */
export function KnowledgeHubView({
  content,
  articles,
}: {
  content: SiteContent;
  articles: PostSummary[];
}) {
  const { knowledgeHub } = content;
  const byTopic = (topic: string) =>
    articles.filter(
      (article) => article.topic.toLowerCase() === topic.toLowerCase(),
    );
  return (
    <>
      <PageHero
        eyebrow={knowledgeHub.title}
        title={knowledgeHub.lead}
        intro={knowledgeHub.intro}
      />

      {articles.length > 0 && (
        <section className="bg-paper">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <h2 className="text-3xl leading-tight font-extrabold text-navy-800 sm:text-4xl">
              Articles
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <PostCard key={article.id} post={article} basePath="/knowledge-hub" />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <h2 className="text-3xl leading-tight font-extrabold text-navy-800 sm:text-4xl">
            Topics
          </h2>
          <ul className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {knowledgeHub.topics.map((topic) => {
              const inTopic = byTopic(topic);
              return (
                <li
                  key={topic}
                  className="flex min-h-44 flex-col justify-between bg-white p-7"
                >
                  <div>
                    <h3 className="text-2xl leading-tight font-extrabold text-navy-800">
                      {topic}
                    </h3>
                    {inTopic.length > 0 && (
                      <ul className="mt-4 grid gap-2">
                        {inTopic.slice(0, 4).map((article) => (
                          <li key={article.id}>
                            <Link
                              href={`/knowledge-hub/${article.slug}`}
                              className="font-medium text-ink underline decoration-sky-brand decoration-2 underline-offset-4 hover:text-navy-700"
                            >
                              {article.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <p className="mt-6 flex items-center gap-3 font-mono text-xs tracking-[0.14em] text-muted uppercase">
                    <span aria-hidden="true" className="h-2 w-5 bg-sky-brand" />
                    {inTopic.length === 0
                      ? knowledgeHub.topicNote
                      : `${inTopic.length} ${inTopic.length === 1 ? "article" : "articles"}`}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <ContactCtaView contact={content.contact} />
    </>
  );
}
