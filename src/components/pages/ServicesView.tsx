import { ContactCtaView } from "@/components/ContactCta";
import { PageHero } from "@/components/PageHero";
import type { SiteContent } from "@/content/sections";
import type { CatalogItem } from "@/lib/catalog";


/**
 * The page itself, given its content. The public route passes the published
 * content; the admin preview passes the saved draft.
 */
export function ServicesView({
  content,
  services,
}: {
  content: SiteContent;
  services: CatalogItem[];
}) {
  const { servicesPage } = content;
  return (
    <>
      <PageHero
        eyebrow={servicesPage.eyebrow}
        title={servicesPage.title}
        intro={servicesPage.intro}
      />

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
          {services.map((service) => (
            <article
              key={service.id}
              className="grid gap-4 border-b border-line py-10 last:border-b-0 md:grid-cols-[0.8fr_1.2fr] md:gap-16"
            >
              <div>
                {service.category && (
                  <p className="mb-3 font-mono text-xs tracking-[0.18em] text-navy-700 uppercase">
                    {service.category}
                  </p>
                )}
                <h2 className="flex items-start gap-4 text-3xl leading-tight font-extrabold text-navy-800 sm:text-4xl">
                  <span
                    aria-hidden="true"
                    className="mt-[0.45em] h-3 w-8 shrink-0 bg-sky-brand"
                  />
                  {service.name}
                </h2>
                {service.full_name && (
                  <p className="mt-3 pl-12 text-lg font-medium text-ink">{service.full_name}</p>
                )}
              </div>
              <div>
                <p className="text-lg leading-relaxed whitespace-pre-line text-muted">
                  {service.description}
                </p>
                {service.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={service.image_url}
                    alt=""
                    loading="lazy"
                    className="mt-6 aspect-[16/9] w-full rounded-2xl object-cover"
                  />
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <ContactCtaView contact={content.contact} />
    </>
  );
}
