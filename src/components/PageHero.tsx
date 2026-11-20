type PageHeroProps = {
  eyebrow: string;
  title: string;
  intro?: string;
};

/** Navy title band used at the top of every inner page. */
export function PageHero({ eyebrow, title, intro }: PageHeroProps) {
  return (
    <section className="bg-navy-800 text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="flex items-center gap-3 font-mono text-xs tracking-[0.18em] text-sky-soft uppercase">
          <span aria-hidden="true" className="flex flex-col gap-[3px]">
            <span className="h-[3px] w-5 bg-sky-brand" />
            <span className="h-[3px] w-5 bg-sky-brand" />
            <span className="h-[3px] w-5 bg-sky-brand" />
          </span>
          {eyebrow}
        </p>
        <h1 className="mt-5 max-w-3xl text-4xl leading-[1.05] font-extrabold sm:text-5xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
            {intro}
          </p>
        )}
      </div>
    </section>
  );
}
