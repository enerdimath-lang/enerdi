import Link from "next/link";

type ProductCardProps = {
  index: number;
  name: string;
  fullName?: string;
  category?: string;
  text: string;
  image?: string;
};

/** A product: its picture (or a quiet patterned header), category, name and summary. */
export function ProductCard({ index, name, fullName, category, text, image }: ProductCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:border-sky-brand/60 hover:shadow-[0_24px_60px_rgba(4,30,92,0.14)]">
      <div className="relative aspect-[16/9] overflow-hidden bg-linear-to-br from-navy-900 to-navy-700">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          // No picture yet: the product's name on a faint grid.
          <div
            aria-hidden="true"
            className="flex h-full items-end p-6"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(155,225,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(155,225,255,0.1) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          >
            <span className="font-display text-4xl leading-none font-extrabold tracking-tight text-white/90">
              {name}
            </span>
          </div>
        )}
        <span className="absolute top-4 left-4 rounded-md bg-white/95 px-2.5 py-1 font-mono text-[0.68rem] tracking-[0.14em] text-navy-800 uppercase">
          {category || `Product ${String(index + 1).padStart(2, "0")}`}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <h3 className="text-2xl leading-tight font-extrabold text-navy-800">{name}</h3>
        {fullName && <p className="mt-1.5 font-medium text-navy-700">{fullName}</p>}
        <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed whitespace-pre-line text-muted">
          {text}
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy-800 transition-colors duration-300 hover:text-navy-700"
        >
          Ask about {name}
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </article>
  );
}
