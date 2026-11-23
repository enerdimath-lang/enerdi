import { ContactForm } from "@/components/ContactForm";
import { PageHero } from "@/components/PageHero";
import type { SiteContent } from "@/content/sections";


/**
 * The page itself, given its content. The public route passes the published
 * content; the admin preview passes the saved draft.
 */
export function ContactView({
  content,
}: {
  content: SiteContent;
}) {
  const { contact } = content;
  return (
    <>
      <PageHero eyebrow={contact.title} title={contact.lead} />

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="grid content-start gap-5">
            {contact.paragraphs.map((paragraph, index) => (
              <p
                key={paragraph}
                className={
                  index === 0
                    ? "font-display text-3xl leading-tight font-extrabold text-navy-800 [font-stretch:112%]"
                    : "text-lg leading-relaxed text-muted"
                }
              >
                {paragraph}
              </p>
            ))}
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
