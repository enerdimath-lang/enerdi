import type { Metadata } from "next";
import { ContactCta } from "@/components/ContactCta";
import { PageHero } from "@/components/PageHero";
import { about } from "@/content/site";

export const metadata: Metadata = {
  title: about.title,
  description: about.lead,
};

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow={about.title} title={about.lead} intro={about.statement} />

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <h2 className="text-3xl leading-tight font-extrabold text-navy-800 sm:text-4xl">
            Who we are
          </h2>
          <div className="grid gap-5 text-lg leading-relaxed text-muted">
            {about.paragraphs.map((paragraph, index) => (
              <p key={paragraph} className={index === 0 ? "text-xl text-ink" : ""}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <h2 className="text-3xl leading-tight font-extrabold text-navy-800 sm:text-4xl">
            Our business units
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {about.businessUnits.map((unit) => (
              <article
                key={unit.title}
                className="rounded-[2rem] border-2 border-sky-brand bg-navy-900 p-9 text-white"
              >
                <h3 className="text-3xl leading-tight font-extrabold text-sky-brand">
                  {unit.title}
                </h3>
                <p className="mt-4 text-lg leading-relaxed text-white/75">
                  {unit.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <h2 className="text-3xl leading-tight font-extrabold text-navy-800 sm:text-4xl">
            {about.model.title}
          </h2>
          <div className="grid gap-5 border-l-[6px] border-sky-brand pl-7 text-lg leading-relaxed text-muted">
            {about.model.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <ContactCta />
    </>
  );
}
