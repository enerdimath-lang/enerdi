type ProductCardProps = {
  index: number;
  name: string;
  fullName?: string;
  text: string;
};

export function ProductCard({ index, name, fullName, text }: ProductCardProps) {
  return (
    <article className="flex min-h-64 flex-col justify-between rounded-[2rem] border-2 border-sky-brand bg-navy-900 p-8 text-white">
      <p className="font-mono text-xs tracking-[0.18em] text-sky-soft">
        PRODUCT {String(index + 1).padStart(2, "0")}
      </p>
      <div className="mt-10">
        <h3 className="text-3xl leading-tight font-extrabold text-sky-brand">
          {name}
        </h3>
        {fullName && (
          <p className="mt-2 text-lg font-medium text-white">{fullName}</p>
        )}
        <p className="mt-4 text-[0.95rem] leading-relaxed text-white/70">
          {text}
        </p>
      </div>
    </article>
  );
}
