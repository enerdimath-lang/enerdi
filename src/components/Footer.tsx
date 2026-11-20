import Link from "next/link";
import { navigation, site } from "@/content/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-navy-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.2fr_1fr]">
        <div>
          <Link href="/" aria-label="ENERDI home" className="inline-block">
            <Logo tone="light" />
          </Link>
          <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-white/70">
            {site.description}
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-8 gap-y-3 text-[0.95rem]">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-white/80 transition-colors hover:text-sky-brand"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-5 py-5 font-mono text-xs text-white/50 sm:px-8">
          {site.copyright}
        </p>
      </div>
    </footer>
  );
}
