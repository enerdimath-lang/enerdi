import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { ContactCtaView } from "@/components/ContactCta";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { ProductCard } from "@/components/ProductCard";
import type { SiteContent } from "@/content/sections";
import type { CatalogItem } from "@/lib/catalog";
import { isSafeHref } from "@/lib/navigation";

const containerClass = "mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24";
const eyebrowClass = "font-mono text-xs tracking-[0.18em] text-navy-700 uppercase";
const eyebrowOnDarkClass = "font-mono text-xs tracking-[0.18em] text-sky-soft uppercase";
const headingClass =
  "mt-4 text-3xl leading-[1.1] font-extrabold text-navy-800 sm:text-4xl lg:text-[2.75rem]";
const textLinkClass =
  "group inline-flex items-center gap-2 font-semibold text-navy-800 transition-colors duration-300 hover:text-navy-700";
const primaryButtonClass =
  "group inline-flex items-center justify-center gap-2 rounded-md bg-sky-brand px-6 py-3.5 text-center text-base font-semibold text-navy-950 shadow-[0_10px_30px_rgba(18,184,255,0.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-white";
const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-md border border-white/25 bg-white/5 px-6 py-3.5 text-center text-base font-semibold text-white transition duration-300 hover:border-white/70 hover:bg-white/10";

/** A faint grid, like drawing paper, that fades out towards the edges. */
const gridBackdrop = {
  backgroundImage:
    "linear-gradient(to right, rgba(155, 225, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(155, 225, 255, 0.08) 1px, transparent 1px)",
  backgroundSize: "64px 64px",
  maskImage: "radial-gradient(ellipse 80% 90% at 50% 30%, black 20%, transparent 100%)",
  WebkitMaskImage: "radial-gradient(ellipse 80% 90% at 50% 30%, black 20%, transparent 100%)",
};

function Arrow() {
  return (
    <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
      →
    </span>
  );
}

/**
 * How many opening letters of each word continue the name, and at least one:
 * ENERgy, Data, Intelligence spell ENER + D + I.
 */
function nameLetters(name: string, words: string[]): number[] {
  let rest = name.toLowerCase();
  return words.map((word) => {
    let shared = 0;
    while (shared < word.length && shared < rest.length && word[shared].toLowerCase() === rest[shared]) {
      shared += 1;
    }
    rest = rest.slice(shared);
    return Math.max(shared, 1);
  });
}

/** One of three small moving diagrams: a flow line, a set of bars, a trend line. */
function StageDiagram({ kind }: { kind: number }) {
  if (kind === 0) {
    return (
      <svg viewBox="0 0 160 40" className="h-10 w-full" fill="none">
        <path
          d="M4 28H52V12H108V28H156"
          stroke="#12b8ff"
          strokeWidth="2"
          strokeDasharray="6 6"
          className="viz-flow"
        />
        {[
          [0, 24],
          [48, 8],
          [104, 24],
          [152, 24],
        ].map(([x, y]) => (
          <rect key={x} x={x} y={y} width="8" height="8" fill="#9be1ff" />
        ))}
      </svg>
    );
  }
  if (kind === 1) {
    const heights = [14, 22, 18, 30, 24, 34, 20, 28, 36, 26, 32, 38];
    return (
      <svg viewBox="0 0 160 40" className="h-10 w-full">
        {heights.map((height, index) => (
          <rect
            key={index}
            x={index * 13 + 3}
            y={40 - height}
            width="8"
            height={height}
            rx="1"
            fill={index % 3 === 2 ? "#12b8ff" : "rgba(155,225,255,0.45)"}
            className="viz-bar"
            style={{ animationDelay: `${index * 0.15}s` }}
          />
        ))}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 160 40" className="h-10 w-full" fill="none">
      <path d="M4 34C28 32 40 22 62 24S100 10 122 13S148 6 156 5V40H4Z" fill="rgba(18,184,255,0.12)" />
      <path
        d="M4 34C28 32 40 22 62 24S100 10 122 13S148 6 156 5"
        stroke="#12b8ff"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="viz-draw"
      />
    </svg>
  );
}

/**
 * The picture in the hero: the three parts of the name as stages, each with
 * a small moving diagram, and the products that come out of them.
 */
function PlatformVisual({
  site,
  products,
}: {
  site: SiteContent["site"];
  products: CatalogItem[];
}) {
  const letters = nameLetters(site.name, site.meaning);
  return (
    <div
      role="img"
      aria-label={`${site.name}: ${site.meaning.join(", ")}`}
      className="rounded-2xl border border-white/15 bg-white/[0.06] p-5 shadow-[0_30px_80px_rgba(2,12,43,0.6)] backdrop-blur-md sm:p-6"
    >
      <div className="flex items-center justify-between">
        <span className="font-logo text-lg font-extrabold tracking-[0.06em] [font-stretch:112%]">
          {site.name}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-sky-brand" />
          <span className="h-2 w-2 rounded-sm bg-sky-brand/60" />
          <span className="h-2 w-2 rounded-sm bg-sky-brand/30" />
        </span>
      </div>

      <ol className="mt-5 grid gap-2.5">
        {site.meaning.map((word, index) => (
          <li
            key={word}
            className="grid grid-cols-[1.75rem_1fr] items-center gap-x-3 rounded-xl border border-white/10 bg-navy-950/50 px-4 py-3.5 sm:grid-cols-[1.75rem_9.5rem_1fr]"
          >
            <span className="font-mono text-[0.7rem] tracking-[0.14em] text-sky-soft">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight">
              <span className="text-sky-brand">{word.slice(0, letters[index])}</span>
              {word.slice(letters[index])}
            </span>
            <span className="col-span-2 mt-2 sm:col-span-1 sm:mt-0">
              <StageDiagram kind={index % 3} />
            </span>
          </li>
        ))}
      </ol>

      {products.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
          <span className="mr-1 font-mono text-[0.68rem] tracking-[0.16em] text-sky-soft uppercase">
            Products
          </span>
          {products.slice(0, 4).map((product) => (
            <span
              key={product.id}
              className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1 text-sm font-semibold"
            >
              {product.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * A small line icon for each capability in the strip under the hero, chosen
 * from the words of its label so the admin can reword or reorder the strip.
 */
const capabilityStripIcons: [RegExp, string][] = [
  // Two overlapping squares: the asset and its twin
  [/twin|model|simulat/, "M4 4h11v11H4zM9 9h11v11H9z"],
  // Bars
  [/data|analy|intellig|insight/, "M4 20V11M10 20V4M16 20v-7M22 20H2"],
  // Rising trend
  [/production|optimi|assurance|perform/, "M3 17l6-6 4 4 8-8M15 7h6v6"],
  // Speech bubble
  [/consult|advis|engineer/, "M4 5h16v11H10l-4 4v-4H4z"],
  // Leaf
  [/clean|carbon|hydrogen|renew|sustain|green/, "M5 19c0-8 5-13 14-14 0 9-5 14-14 14zM5 19l8-8"],
  // Open book
  [
    /knowledge|transfer|train|learn/,
    "M12 6c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-13c-3-.5-6 0-8 1.5zM12 6v13",
  ],
];

/** Used when a label matches none of the above: a plain square mark. */
const defaultStripIcon = "M5 5h14v14H5zM9 9h6v6H9z";

function stripIcon(label: string): string {
  const text = label.toLowerCase();
  return capabilityStripIcons.find(([words]) => words.test(text))?.[1] ?? defaultStripIcon;
}

/** Simple line icons for the capability cards, used in turn. */
const capabilityIcons = [
  // Compass: consulting
  "M12 3a9 9 0 100 18 9 9 0 000-18zM15.5 8.5l-2 5-5 2 2-5z",
  // Stack: products
  "M12 3l9 5-9 5-9-5zM3 12.5l9 5 9-5M3 17l9 5 9-5",
  // Open book: knowledge
  "M12 6c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-13c-3-.5-6 0-8 1.5zM12 6v13",
  // Chart: analysis
  "M4 20V10M10 20V4M16 20v-7M22 20H2",
];

/**
 * The page itself, given its content. The public route passes the published
 * content; the admin preview passes the saved draft.
 */
export function HomeView({
  content,
  products,
  services,
}: {
  content: SiteContent;
  products: CatalogItem[];
  services: CatalogItem[];
}) {
  const { site, hero, home, about, knowledgeHub, ideaFactory } = content;
  const slides = content.slides.filter((slide) => slide.enabled && slide.title);
  const capabilities = hero.capabilities.map((label) => label.trim()).filter(Boolean);

  /** Each block of the page; `home.blocks` decides the order and which ones show. */
  const blocks: Record<string, ReactNode> = {
    // About: who ENERDI is, and its two business units
    about: (
      <section className="bg-white">
        <div className={`${containerClass} grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16`}>
          <div className="reveal">
            <p className={eyebrowClass}>About us</p>
            <h2 className={headingClass}>{about.lead}</h2>
            <p className="mt-6 text-xl leading-relaxed text-ink">{about.statement}</p>
            <p className="mt-4 text-lg leading-relaxed text-muted">{about.paragraphs.join(" ")}</p>
            <p className="mt-8">
              <Link href="/about" className={textLinkClass}>
                More about {site.name} <Arrow />
              </Link>
            </p>
          </div>
          <div className="reveal grid content-start gap-4">
            {about.businessUnits.map((unit, index) => (
              <article
                key={unit.title}
                className="rounded-2xl border border-line bg-paper p-6 transition duration-300 hover:border-sky-brand/60 hover:bg-white hover:shadow-[0_20px_50px_rgba(4,30,92,0.1)] sm:p-7"
              >
                <p className="font-mono text-[0.7rem] tracking-[0.16em] text-sky-brand">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-xl font-extrabold text-navy-800 sm:text-2xl">{unit.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{unit.text}</p>
              </article>
            ))}
            {about.model.paragraphs.length > 0 && (
              <div className="rounded-2xl bg-navy-800 p-6 text-white sm:p-7">
                <p className={eyebrowOnDarkClass}>{about.model.title}</p>
                <p className="mt-3 text-lg leading-relaxed text-white/85">
                  {about.model.paragraphs[about.model.paragraphs.length - 1]}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    ),

    // Products
    products: products.length > 0 && (
      <section className="bg-paper">
        <div className={containerClass}>
          <div className="reveal flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={eyebrowClass}>{home.productsEyebrow}</p>
              <h2 className={headingClass}>{home.productsTitle}</h2>
            </div>
            <Link href="/products" className={textLinkClass}>
              All products <Arrow />
            </Link>
          </div>
          <div className="reveal mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map((product, index) => (
              <ProductCard
                key={product.id}
                index={index}
                name={product.name}
                fullName={product.full_name}
                category={product.category}
                text={product.description}
                image={product.image_url}
              />
            ))}
          </div>
        </div>
      </section>
    ),

    // Services, as capability cards
    services: services.length > 0 && (
      <section className="bg-white">
        <div className={containerClass}>
          <div className="reveal flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={eyebrowClass}>{home.servicesEyebrow}</p>
              <h2 className={headingClass}>{home.servicesTitle}</h2>
            </div>
            <Link href="/services" className={textLinkClass}>
              All services <Arrow />
            </Link>
          </div>
          <div className="reveal mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((service, index) => (
              <article
                key={service.id}
                className="group rounded-2xl border border-line bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-sky-brand/60 hover:shadow-[0_24px_60px_rgba(4,30,92,0.12)] sm:p-8"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-800 text-sky-brand transition-colors duration-300 group-hover:bg-sky-brand group-hover:text-navy-950">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                    <path
                      d={capabilityIcons[index % capabilityIcons.length]}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <h3 className="mt-6 text-2xl font-extrabold text-navy-800">{service.name}</h3>
                {service.full_name && (
                  <p className="mt-1.5 font-medium text-navy-700">{service.full_name}</p>
                )}
                <p className="mt-3 leading-relaxed text-muted">{service.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    ),

    // Knowledge Hub (the problems we solve) and The Idea Factory (what is in the works)
    knowledgeHubAndIdeaFactory: (
      <>
        <section className="relative isolate overflow-hidden bg-navy-900 text-white">
          <div aria-hidden="true" className="absolute inset-0 -z-10" style={gridBackdrop} />
          <div className={`${containerClass} grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16`}>
            <div className="reveal">
              <p className={eyebrowOnDarkClass}>{knowledgeHub.title}</p>
              <h2 className="mt-4 text-3xl leading-[1.1] font-extrabold sm:text-4xl lg:text-[2.75rem]">
                {knowledgeHub.lead}
              </h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-white/75">
                {knowledgeHub.intro}
              </p>
              <p className="mt-8">
                <Link href="/knowledge-hub" className={primaryButtonClass}>
                  Open the {knowledgeHub.title} <Arrow />
                </Link>
              </p>
            </div>
            <ul className="reveal grid content-start gap-3 sm:grid-cols-2">
              {knowledgeHub.topics.map((topic, index) => (
                <li key={topic}>
                  <Link
                    href="/knowledge-hub"
                    className="group flex h-full items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4 transition duration-300 hover:border-sky-brand/70 hover:bg-white/10"
                  >
                    <span className="pt-0.5 font-mono text-[0.7rem] tracking-[0.14em] text-sky-soft">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 leading-snug font-semibold">{topic}</span>
                    <Arrow />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-paper">
          <div className={containerClass}>
            <div className="reveal flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className={eyebrowClass}>{ideaFactory.title}</p>
                <h2 className={headingClass}>{ideaFactory.lead}</h2>
                <p className="mt-4 text-lg leading-relaxed text-muted">{ideaFactory.intro}</p>
              </div>
              <Link href="/idea-factory" className={textLinkClass}>
                Visit {ideaFactory.title} <Arrow />
              </Link>
            </div>
            {ideaFactory.ideas.length > 0 && (
              <div className="reveal mt-10 grid gap-6 lg:grid-cols-2">
                {ideaFactory.ideas.slice(0, 4).map((idea) => (
                  <Link
                    key={idea.name}
                    href="/idea-factory"
                    className="group rounded-2xl border border-line bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-sky-brand/60 hover:shadow-[0_24px_60px_rgba(4,30,92,0.12)] sm:p-8"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-3xl leading-none font-extrabold text-navy-800">
                        {idea.name}
                      </h3>
                      {idea.status && (
                        <span className="inline-flex items-center gap-2 rounded-md bg-navy-800 px-3 py-1.5 font-mono text-[0.68rem] tracking-[0.14em] text-white uppercase">
                          <span aria-hidden="true" className="h-1.5 w-1.5 bg-sky-brand" />
                          {idea.status}
                        </span>
                      )}
                    </div>
                    {idea.kind && <p className="mt-3 font-medium text-navy-700">{idea.kind}</p>}
                    <p className="mt-3 line-clamp-3 leading-relaxed text-muted">{idea.summary}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </>
    ),
  };

  return (
    <>
      {/* Hero: what ENERDI does for you, the two ways in, and the platform picture */}
      <section className="relative isolate overflow-hidden bg-linear-to-br from-navy-950 via-navy-900 to-navy-800 text-white">
        <div
          aria-hidden="true"
          className="hero-glow absolute -top-40 left-1/3 -z-10 h-[44rem] w-[64rem]"
          style={{
            backgroundImage: "radial-gradient(closest-side, rgba(18,184,255,0.3), transparent)",
          }}
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10" style={gridBackdrop} />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pt-14 pb-14 sm:px-8 sm:pt-20 sm:pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pt-24 lg:pb-20">
          <div>
            <p className="inline-flex items-center gap-2.5 rounded-md border border-white/15 bg-white/5 px-3 py-2 font-mono text-[0.7rem] leading-snug tracking-[0.16em] text-sky-soft uppercase">
              <span aria-hidden="true" className="h-2 w-2 shrink-0 bg-sky-brand" />
              {hero.eyebrow}
            </p>
            <h1 className="mt-6 text-[2.5rem] leading-[1.05] font-extrabold sm:text-6xl lg:text-[4rem]">
              {hero.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80 sm:text-xl">
              {hero.intro}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link
                href={isSafeHref(hero.primaryCta.href) ? hero.primaryCta.href : "/"}
                className={primaryButtonClass}
              >
                {hero.primaryCta.label} <Arrow />
              </Link>
              <Link
                href={isSafeHref(hero.secondaryCta.href) ? hero.secondaryCta.href : "/"}
                className={secondaryButtonClass}
              >
                {hero.secondaryCta.label}
              </Link>
            </div>
          </div>

          <PlatformVisual site={site} products={products} />
        </div>

        {/* What ENERDI does, at a glance: capabilities, not counts */}
        {capabilities.length > 0 && (
        <div className="border-t border-white/10 bg-navy-950/40">
          <ul
            aria-label={`What ${site.name} does`}
            className="mx-auto grid max-w-7xl grid-cols-2 px-5 py-2 sm:grid-cols-3 sm:px-8 lg:flex lg:py-0"
          >
            {capabilities.map((label, index) => (
              <li
                key={`${index}-${label}`}
                className={`group flex items-center gap-3 py-3.5 lg:flex-auto lg:justify-center lg:px-4 lg:py-6 ${
                  index > 0 ? "lg:border-l lg:border-white/10" : ""
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-sky-brand transition-transform duration-300 group-hover:-translate-y-0.5"
                >
                  <path
                    d={stripIcon(label)}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm leading-tight font-medium text-white/80 transition-colors duration-300 group-hover:text-white">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
        )}
      </section>

      {/* The focus areas: capability cards, with a panel that follows the chosen one */}
      <HeroSlideshow slides={slides}>
        <div className="max-w-3xl">
          {home.focusEyebrow && <p className={eyebrowClass}>{home.focusEyebrow}</p>}
          {home.focusTitle && <h2 className={headingClass}>{home.focusTitle}</h2>}
          {home.focusIntro && (
            <p className="mt-4 text-lg leading-relaxed text-muted sm:text-xl">{home.focusIntro}</p>
          )}
        </div>
      </HeroSlideshow>

      {home.blocks
        .filter((item) => item.show)
        .map((item) => (
          <Fragment key={item.block}>{blocks[item.block]}</Fragment>
        ))}

      <ContactCtaView contact={content.contact} />
    </>
  );
}
