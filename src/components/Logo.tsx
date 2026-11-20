type LogoProps = {
  /** "dark" for light backgrounds, "light" for navy backgrounds */
  tone?: "dark" | "light";
  className?: string;
};

/** The ENERDI mark: a navy square holding three sky-blue bars. */
export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="48" height="48" fill="#00205b" />
      <rect x="8" y="8" width="32" height="32" fill="#ffffff" />
      <rect x="10" y="10" width="28" height="8" fill="#00aeef" />
      <rect x="10" y="20" width="28" height="8" fill="#00aeef" />
      <rect x="10" y="30" width="28" height="8" fill="#00aeef" />
    </svg>
  );
}

export function Logo({ tone = "dark", className = "" }: LogoProps) {
  const base = tone === "dark" ? "text-navy-800" : "text-white";

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <LogoMark
        className={`h-9 w-9 shrink-0 ${
          tone === "light" ? "outline outline-1 outline-white/25" : ""
        }`}
      />
      <span
        className={`font-display text-[1.65rem] leading-none font-extrabold tracking-[0.04em] [font-stretch:112%] ${base}`}
      >
        E<span className="text-sky-brand">N</span>ER
        <span className="text-sky-brand">D</span>I
      </span>
    </span>
  );
}
