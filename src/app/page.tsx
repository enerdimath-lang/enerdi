import Link from "next/link";
import { ContactCta } from "@/components/ContactCta";
import { ProductCard } from "@/components/ProductCard";
import {
  about,
  focusAreas,
  hero,
  ideaFactory,
  knowledgeHub,
  products,
  services,
} from "@/content/site";

const eyebrowClass =
  "font-mono text-xs tracking-[0.18em] text-navy-700 uppercase";
const textLinkClass =
  "inline-flex items-center gap-2 font-semibold text-navy-800 underline decoration-sky-brand decoration-2 underline-offset-[6px] hover:text-navy-700";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy-800 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:py-24">
          <div>
            <p className="font-mono text-xs tracking-[0.18em] text-sky-soft uppercase">
              {hero.eyebrow}
            </p>
            <h1 className="mt-5 text-[2.6rem] leading-[1.02] font-extrabold sm:text-6xl">
              {hero.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
              {hero.intro}
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href={hero.primaryCta.href}
                className="inline-flex items-center justify-center bg-sky-brand px-7 py-4 text-base font-semibold text-navy-950 transition-colors hover:bg-sky-soft"
              >
                {hero.primaryCta.label}
              </Link>
              <Link
                href={hero.secondaryCta.href}
                className="inline-flex items-center justify-center border border-white/40 px-7 py-4 text-base font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
              >
                {hero.secondaryCta.label}
              </Link>
            </div>
          </div>

          {/* The logo mark, enlarged: each bar carries one focus area */}
          <div className="bg-white p-3 sm:p-4">
            <ul className="grid gap-3 sm:gap-4">
              {focusAreas.map((area, index) => (
                <li
                  key={area.title}
                  className="animate-bar-in bg-sky-brand px-6 py-6 text-navy-950 sm:px-8 sm:py-7"
                  style={{ animationDelay: `${150 + index * 140}ms` }}
                >
                  <p className="font-mono text-xs font-medium tracking-[0.18em] text-navy-800">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-1 text-2xl leading-tight font-extrabold sm:text-[1.7rem]">
                    {area.title}
                  </h2>
                  <p className="mt-2 text-[0.95rem] leading-snug text-navy-900">
                    {area.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className={eyebrowClass}>About us</p>
            <h2 className="mt-4 text-3xl leading-tight font-extrabold text-navy-800 sm:text-4xl">
              {about.lead}
            </h2>
          </div>
          <div>
            <p className="text-xl leading-relaxed text-ink">
              {about.statement}
            </p>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              {about.paragraphs.join(" ")}
            </p>
            <p className="mt-8">
              <Link href="/about" className={textLinkClass}>
                More about ENERDI <span aria-hidden="true">→</span>
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={eyebrowClass}>Products</p>
              <h2 className="mt-4 text-3xl leading-tight font-extrabold text-navy-800 sm:text-4xl">
                Our products
              </h2>
            </div>
            <Link href="/products" className={textLinkClass}>
              All products <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {products.map((product, index) => (
              <ProductCard key={product.name} index={index} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={eyebrowClass}>Services</p>
              <h2 className="mt-4 text-3xl leading-tight font-extrabold text-navy-800 sm:text-4xl">
                What we do
              </h2>
            </div>
            <Link href="/services" className={textLinkClass}>
              All services <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
            {services.map((service) => (
              <article
                key={service.title}
                className="border-t-[6px] border-sky-brand pt-6"
              >
                <h3 className="text-2xl font-extrabold text-navy-800">
                  {service.title}
                </h3>
                <p className="mt-3 leading-relaxed text-muted">
                  {service.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Knowledge Hub and The Idea Factory */}
      <section className="bg-navy-900 text-white">
        <div className="mx-auto grid max-w-7xl px-5 sm:px-8 md:grid-cols-2">
          <div className="border-white/15 py-16 md:border-r md:pr-12">
            <p className="font-mono text-xs tracking-[0.18em] text-sky-soft uppercase">
              {knowledgeHub.title}
            </p>
            <h2 className="mt-4 text-3xl leading-tight font-extrabold">
              {knowledgeHub.lead}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/75">
              {knowledgeHub.intro}
            </p>
            <p className="mt-7">
              <Link
                href="/knowledge-hub"
                className="inline-flex items-center gap-2 font-semibold text-sky-brand underline decoration-2 underline-offset-[6px] hover:text-sky-soft"
              >
                Open the Knowledge Hub <span aria-hidden="true">→</span>
              </Link>
            </p>
          </div>
          <div className="border-t border-white/15 py-16 md:border-t-0 md:pl-12">
            <p className="font-mono text-xs tracking-[0.18em] text-sky-soft uppercase">
              {ideaFactory.title}
            </p>
            <h2 className="mt-4 text-3xl leading-tight font-extrabold">
              {ideaFactory.lead}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/75">
              {ideaFactory.intro}
            </p>
            <p className="mt-7">
              <Link
                href="/idea-factory"
                className="inline-flex items-center gap-2 font-semibold text-sky-brand underline decoration-2 underline-offset-[6px] hover:text-sky-soft"
              >
                Visit The Idea Factory <span aria-hidden="true">→</span>
              </Link>
            </p>
          </div>
        </div>
      </section>

      <ContactCta />
    </>
  );
}
