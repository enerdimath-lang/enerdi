import { ContactCtaView } from "@/components/ContactCta";
import { PageHero } from "@/components/PageHero";
import type { SiteContent } from "@/content/sections";


/**
 * The page itself, given its content. The public route passes the published
 * content; the admin preview passes the saved draft.
 */
export function AboutView({
  content,
}: {
  content: SiteContent;
}) {
  const { about } = content;
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
            {about.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={about.image} alt="" className="mt-4 w-full rounded-2xl object-cover" />
            )}
          </div>
        </div>
      </section>

      {about.sections
        .filter((section) => section.title || section.text || section.image)
        .map((section, index) => (
          <section key={index} className={index % 2 === 0 ? "bg-paper" : "bg-white"}>
            <div
              className={`mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:gap-16 ${
                section.image ? "lg:grid-cols-2 lg:items-center" : "lg:grid-cols-[0.8fr_1.2fr]"
              }`}
            >
              <div className={section.image ? "" : "contents"}>
                <h2 className="text-3xl leading-tight font-extrabold text-navy-800 sm:text-4xl">
                  {section.title}
                </h2>
                <p
                  className={`text-lg leading-relaxed whitespace-pre-line text-muted ${
                    section.image ? "mt-5" : ""
                  }`}
                >
                  {section.text}
                </p>
              </div>
              {section.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={section.image}
                  alt=""
                  loading="lazy"
                  className="aspect-[4/3] w-full rounded-2xl object-cover"
                />
              )}
            </div>
          </section>
        ))}

      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <h2 className="text-3xl leading-tight font-extrabold text-navy-800 sm:text-4xl">
            Our business units
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {about.businessUnits.map((unit) => (
              <article
                key={unit.title}
                className="rounded-2xl border-2 border-sky-brand bg-navy-900 p-9 text-white"
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

      <ContactCtaView contact={content.contact} />
    </>
  );
}
