import type { Metadata } from "next";
import { ContactCta } from "@/components/ContactCta";
import { PageHero } from "@/components/PageHero";
import { ideaFactory } from "@/content/site";

export const metadata: Metadata = {
  title: ideaFactory.title,
  description: ideaFactory.lead,
};

export default function IdeaFactoryPage() {
  return (
    <>
      <PageHero
        eyebrow={ideaFactory.title}
        title={ideaFactory.lead}
        intro={ideaFactory.intro}
      />

      <section className="bg-paper">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-20 sm:px-8">
          {ideaFactory.ideas.map((idea, index) => (
            <article
              key={idea.name}
              className="grid gap-8 border border-line bg-white p-8 sm:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16"
            >
              <div>
                <p className="font-mono text-xs tracking-[0.18em] text-navy-700 uppercase">
                  Idea {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-4 text-5xl leading-none font-extrabold text-navy-800">
                  {idea.name}
                </h2>
                <p className="mt-3 text-lg font-medium text-ink">{idea.kind}</p>
                <p className="mt-6 inline-flex items-center gap-3 bg-navy-800 px-4 py-2 font-mono text-xs tracking-[0.14em] text-white uppercase">
                  <span aria-hidden="true" className="h-2 w-2 bg-sky-brand" />
                  {idea.status}
                </p>
              </div>
              <div>
                <p className="text-lg leading-relaxed text-muted">
                  {idea.summary}
                </p>
                <ul className="mt-7 grid gap-4">
                  {idea.points.map((point) => (
                    <li
                      key={point}
                      className="flex gap-4 text-lg leading-relaxed text-ink"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[0.7em] h-[3px] w-5 shrink-0 bg-sky-brand"
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <ContactCta />
    </>
  );
}
