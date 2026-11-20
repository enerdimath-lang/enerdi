import type { Metadata } from "next";
import { ContactCta } from "@/components/ContactCta";
import { PageHero } from "@/components/PageHero";
import { services } from "@/content/site";

export const metadata: Metadata = {
  title: "Services",
  description: "Consulting, products and knowledge transfer from ENERDI.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Consulting, products and knowledge transfer."
        intro="Three ways we work with you on a specific problem."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
          {services.map((service) => (
            <article
              key={service.title}
              className="grid gap-4 border-b border-line py-10 last:border-b-0 md:grid-cols-[0.8fr_1.2fr] md:gap-16"
            >
              <h2 className="flex items-start gap-4 text-3xl leading-tight font-extrabold text-navy-800 sm:text-4xl">
                <span
                  aria-hidden="true"
                  className="mt-[0.45em] h-3 w-8 shrink-0 bg-sky-brand"
                />
                {service.title}
              </h2>
              <p className="text-lg leading-relaxed text-muted">
                {service.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <ContactCta />
    </>
  );
}
