"use client";

import { useCallback, useEffect, useState, type KeyboardEvent, type ReactNode } from "react";

export type Slide = {
  title: string;
  text: string;
  image: string;
  /** Which moving picture the panel shows; see `choices` in content/sections.ts. */
  visual?: string;
  /** Short outcomes on the card. */
  tags?: string[];
  /** The results under the picture. */
  outcomes?: { value: string; label: string }[];
};

const SLIDE_MS = 7000;

type Kind = "production" | "analytics" | "twin" | "generic";

/**
 * Which moving picture goes with a focus area: the one the admin picked, or,
 * for content saved before that choice existed, one worked out from the
 * title. Anything else shows the area's own uploaded picture.
 */
function kindOf(slide: Slide): Kind {
  if (slide.visual === "production" || slide.visual === "analytics" || slide.visual === "twin") {
    return slide.visual;
  }
  if (slide.visual) return "generic";

  const text = slide.title.toLowerCase();
  if (text.includes("twin")) return "twin";
  if (text.includes("data") || text.includes("analy")) return "analytics";
  if (text.includes("production") || text.includes("assurance") || text.includes("optimi")) {
    return "production";
  }
  return "generic";
}

/** The short outcomes on a card, without empty rows. */
function tagsOf(slide: Slide): string[] {
  return (slide.tags ?? []).map((tag) => tag.trim()).filter(Boolean);
}

/** The results under the picture, without empty rows. */
function outcomesOf(slide: Slide) {
  return (slide.outcomes ?? []).filter((item) => item.value.trim() || item.label.trim()).slice(0, 3);
}

const tinyLabel = "font-mono text-[0.62rem] tracking-[0.14em] text-sky-soft uppercase";

/** Asset performance: three indicators and a production trend against its target. */
function ProductionVisual() {
  const indicators = [
    { label: "Uptime", fill: "92%" },
    { label: "Throughput", fill: "78%" },
    { label: "Wells online", fill: "86%" },
  ];
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        {indicators.map((item, index) => (
          <div key={item.label} className="rounded-lg border border-white/10 bg-navy-950/50 p-2.5">
            <p className={tinyLabel}>{item.label}</p>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-sm bg-white/10">
              <div
                className="grow-x h-full bg-sky-brand"
                style={{ width: item.fill, animationDelay: `${index * 0.12}s` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-white/10 bg-navy-950/50 p-3">
        <div className="flex items-center justify-between">
          <p className={tinyLabel}>Production trend</p>
          <p className="flex items-center gap-3 text-[0.68rem] text-white/70">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 bg-sky-brand" /> Actual
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0 w-4 border-t border-dashed border-white/60" /> Target
            </span>
          </p>
        </div>
        <svg viewBox="0 0 400 150" preserveAspectRatio="none" className="mt-2 min-h-0 w-full flex-1" fill="none">
          {[30, 70, 110].map((y) => (
            <path key={y} d={`M0 ${y}H400`} stroke="rgba(155,225,255,0.12)" />
          ))}
          <path d="M0 96C80 92 160 78 240 66S340 50 400 44" stroke="rgba(255,255,255,0.55)" strokeDasharray="5 6" />
          <path
            d="M0 122C40 118 70 104 110 100S170 84 210 74S280 50 320 42S370 26 400 20V150H0Z"
            fill="rgba(18,184,255,0.14)"
          />
          <path
            d="M0 122C40 118 70 104 110 100S170 84 210 74S280 50 320 42S370 26 400 20"
            stroke="#12b8ff"
            strokeWidth="3"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="chart-draw"
          />
        </svg>
      </div>
    </div>
  );
}

/** Analytics: data sources streaming in on the left, the indicators they feed on the right. */
function AnalyticsVisual() {
  const sources = ["Field sensors", "Process data", "Lab results", "Maintenance logs"];
  const bars = [16, 26, 22, 34, 30, 42, 38, 50, 46, 58];
  return (
    <div className="grid h-full grid-cols-[0.95fr_1.05fr] gap-3">
      <div className="flex flex-col justify-between rounded-lg border border-white/10 bg-navy-950/50 p-3">
        <p className={tinyLabel}>Data streams</p>
        {sources.map((source) => (
          <div key={source}>
            <p className="text-[0.72rem] font-medium text-white/85">{source}</p>
            <svg viewBox="0 0 120 6" preserveAspectRatio="none" className="mt-1 h-1.5 w-full" fill="none">
              <path d="M0 3H120" stroke="#12b8ff" strokeWidth="2" strokeDasharray="6 6" className="viz-flow" />
            </svg>
          </div>
        ))}
      </div>
      <div className="flex min-h-0 flex-col gap-3">
        <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-white/10 bg-navy-950/50 p-3">
          <p className={tinyLabel}>KPI trend</p>
          <svg viewBox="0 0 150 64" preserveAspectRatio="none" className="mt-2 min-h-0 w-full flex-1">
            {bars.map((height, index) => (
              <rect
                key={index}
                x={index * 15 + 2}
                y={64 - height}
                width="10"
                height={height}
                rx="1"
                fill={index >= bars.length - 3 ? "#12b8ff" : "rgba(155,225,255,0.4)"}
                className="viz-bar"
                style={{ animationDelay: `${index * 0.12}s` }}
              />
            ))}
          </svg>
        </div>
        <div className="rounded-lg border border-white/10 bg-navy-950/50 p-3">
          <p className={tinyLabel}>Signal</p>
          <svg viewBox="0 0 150 30" preserveAspectRatio="none" className="mt-1.5 h-7 w-full" fill="none">
            <path
              d="M0 22C18 20 26 10 44 14S70 26 88 16S118 4 150 8"
              stroke="#9be1ff"
              strokeWidth="2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className="chart-draw"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

/** Digital twin: the plant on the left, its wireframe copy on the right, data flowing between. */
function TwinVisual() {
  const plant = (
    <>
      <rect x="0" y="20" width="34" height="130" rx="17" />
      <path d="M0 58H34M0 96H34M0 132H34" />
      <rect x="52" y="92" width="64" height="58" rx="4" />
      <path d="M34 44H84V92" fill="none" />
    </>
  );
  return (
    <div className="flex h-full flex-col">
      <div className="flex justify-between">
        <p className={tinyLabel}>Physical asset</p>
        <p className={tinyLabel}>Digital twin</p>
      </div>
      <svg viewBox="0 0 400 180" className="mt-2 min-h-0 w-full flex-1" fill="none">
        <path d="M10 162H390" stroke="rgba(155,225,255,0.35)" strokeWidth="2" />
        <g transform="translate(30 12)" stroke="#ffffff" strokeWidth="3" fill="#041e5c">
          {plant}
        </g>
        <g
          transform="translate(370 12) scale(-1 1)"
          stroke="#12b8ff"
          strokeWidth="2.5"
          strokeDasharray="7 6"
        >
          {plant}
        </g>
        <g stroke="#9be1ff" strokeWidth="2" strokeDasharray="5 7" className="viz-flow">
          <path d="M64 46C140 14 260 14 336 46" />
          <path d="M146 132H254" />
          <path d="M64 150C140 178 260 178 336 150" />
        </g>
        {[
          [60, 42],
          [142, 128],
          [60, 146],
          [332, 42],
          [250, 128],
          [332, 146],
        ].map(([x, y], index) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width="8"
            height="8"
            fill="#12b8ff"
            className="node-pulse"
            style={{ animationDelay: `${index * 0.25}s` }}
          />
        ))}
        <rect x="170" y="72" width="60" height="28" rx="6" fill="#020c2b" stroke="#12b8ff" strokeWidth="2" />
        <text
          x="200"
          y="90"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="11"
          fontFamily="var(--font-mono)"
          letterSpacing="1.5"
        >
          SYNC
        </text>
      </svg>
    </div>
  );
}

/**
 * "What we work on": the focus areas as capability cards, and beside them a
 * panel whose moving picture and three results follow the chosen card. It
 * moves on by itself every few seconds and stops while someone is pointing
 * at it or tabbing through it. Visitors who ask their device for reduced
 * motion get it without auto-play. The heading is passed in as `children`.
 */
export function HeroSlideshow({ slides, children }: { slides: Slide[]; children?: ReactNode }) {
  const [current, setCurrent] = useState(0);
  const [engaged, setEngaged] = useState(false);

  const count = slides.length;
  const go = useCallback(
    (index: number) => setCurrent(((index % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (engaged || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      // A background tab should not be several slides ahead when you return.
      if (!document.hidden) setCurrent((index) => (index + 1) % count);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [engaged, count, current]);

  function onKeyDown(event: KeyboardEvent) {
    if (count < 2) return;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") go(current + 1);
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") go(current - 1);
  }

  const slide = slides[Math.min(current, count - 1)];
  const kind = slide ? kindOf(slide) : "generic";
  const impact = slide ? outcomesOf(slide) : [];

  return (
    <section
      aria-label="What ENERDI works on"
      className="bg-paper"
      onMouseEnter={() => setEngaged(true)}
      onMouseLeave={() => setEngaged(false)}
      onFocus={() => setEngaged(true)}
      onBlur={() => setEngaged(false)}
    >
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
        <div className="reveal">{children}</div>

        {slide && (
          <div className="reveal mt-10 grid items-start gap-6 lg:mt-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
            {/* Capability cards */}
            <ol className="grid min-w-0 gap-4" onKeyDown={onKeyDown}>
              {slides.map((item, index) => {
                const active = index === current;
                const tags = tagsOf(item);
                return (
                  <li key={`${index}-${item.title}`}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => go(index)}
                      className={`relative block w-full overflow-hidden rounded-2xl border p-5 text-left transition duration-300 sm:p-6 ${
                        active
                          ? "border-sky-brand/70 bg-white shadow-[0_20px_50px_rgba(4,30,92,0.14)]"
                          : "border-line bg-white/60 hover:-translate-y-0.5 hover:border-navy-700/40 hover:bg-white hover:shadow-[0_12px_30px_rgba(4,30,92,0.08)]"
                      }`}
                    >
                      <span className="flex items-start gap-4">
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-mono text-sm transition-colors duration-300 ${
                            active ? "bg-navy-800 text-sky-brand" : "bg-navy-800/5 text-navy-700"
                          }`}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-display text-lg leading-snug font-extrabold tracking-tight text-navy-800 sm:text-xl">
                            {item.title}
                          </span>
                          {item.text && (
                            <span className="mt-1.5 block leading-relaxed text-muted">{item.text}</span>
                          )}
                          {tags.length > 0 && (
                            <span className="mt-3.5 flex flex-wrap gap-x-5 gap-y-1.5">
                              {tags.map((tag) => (
                                <span
                                  key={tag}
                                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-300 ${
                                    active ? "text-navy-800" : "text-muted"
                                  }`}
                                >
                                  <span aria-hidden="true" className="text-sky-brand">
                                    →
                                  </span>
                                  {tag}
                                </span>
                              ))}
                            </span>
                          )}
                        </span>
                      </span>
                      {active && !engaged && count > 1 && (
                        <span
                          key={current}
                          aria-hidden="true"
                          className="animate-slide-progress absolute bottom-0 left-0 h-[3px] bg-sky-brand"
                          style={{ animationDuration: `${SLIDE_MS}ms` }}
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>

            {/* The panel that follows the chosen card */}
            <div className="relative isolate overflow-hidden rounded-2xl bg-linear-to-br from-navy-950 via-navy-900 to-navy-800 p-4 text-white shadow-[0_30px_70px_rgba(4,30,92,0.3)] sm:p-6 lg:sticky lg:top-24">
              <div
                aria-hidden="true"
                className="hero-glow absolute -top-1/3 right-0 -z-10 h-[30rem] w-[36rem]"
                style={{
                  backgroundImage: "radial-gradient(closest-side, rgba(18,184,255,0.28), transparent)",
                }}
              />
              <div key={current} className="panel-in">
                <div className="flex items-center justify-between gap-4">
                  <p className="min-w-0 truncate font-display font-extrabold tracking-tight sm:text-lg">
                    <span className="mr-2.5 font-mono text-xs font-normal tracking-[0.14em] text-sky-soft">
                      {String(current + 1).padStart(2, "0")}
                    </span>
                    {slide.title}
                  </p>
                  {kind !== "generic" && (
                    <span className="shrink-0 rounded-md border border-white/15 px-2 py-1 font-mono text-[0.6rem] tracking-[0.14em] text-white/60 uppercase">
                      Illustration
                    </span>
                  )}
                </div>

                <div
                  aria-hidden="true"
                  className="mt-4 h-[17rem] overflow-hidden rounded-xl border border-white/10 bg-white/[0.05] p-3 backdrop-blur-sm sm:h-[19rem] sm:p-4"
                >
                  {kind === "production" && <ProductionVisual />}
                  {kind === "analytics" && <AnalyticsVisual />}
                  {kind === "twin" && <TwinVisual />}
                  {kind === "generic" && slide.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={slide.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full rounded-lg object-cover"
                    />
                  )}
                </div>

                {impact.length > 0 && (
                  <dl className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                    {impact.map((item, index) => (
                      <div
                        key={`${index}-${item.label}`}
                        className="flex min-h-[6.25rem] flex-col rounded-xl border border-white/10 bg-white/[0.06] p-3 sm:p-4"
                      >
                        <dd className="order-first font-display text-xl leading-none font-extrabold tracking-tight text-sky-brand sm:text-3xl">
                          {item.value}
                        </dd>
                        <dt className="mt-2 text-[0.75rem] leading-snug text-white/75 sm:text-sm">
                          {item.label}
                        </dt>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
