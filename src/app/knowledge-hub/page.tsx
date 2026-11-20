import type { Metadata } from "next";
import { ContactCta } from "@/components/ContactCta";
import { PageHero } from "@/components/PageHero";
import { knowledgeHub } from "@/content/site";

export const metadata: Metadata = {
  title: knowledgeHub.title,
  description: knowledgeHub.lead,
};

export default function KnowledgeHubPage() {
  return (
    <>
      <PageHero
        eyebrow={knowledgeHub.title}
        title={knowledgeHub.lead}
        intro={knowledgeHub.intro}
      />

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <h2 className="text-3xl leading-tight font-extrabold text-navy-800 sm:text-4xl">
            Topics
          </h2>
          <ul className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {knowledgeHub.topics.map((topic) => (
              <li
                key={topic}
                className="flex min-h-44 flex-col justify-between bg-white p-7"
              >
                <h3 className="text-2xl leading-tight font-extrabold text-navy-800">
                  {topic}
                </h3>
                <p className="mt-6 flex items-center gap-3 font-mono text-xs tracking-[0.14em] text-muted uppercase">
                  <span aria-hidden="true" className="h-2 w-5 bg-sky-brand" />
                  {knowledgeHub.topicNote}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ContactCta />
    </>
  );
}
