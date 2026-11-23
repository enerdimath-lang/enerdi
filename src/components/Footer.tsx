import Link from "next/link";
import { getContent } from "@/lib/content";
import type { SiteContent } from "@/content/sections";
import { getMenu, isSafeHref, type MenuItem } from "@/lib/navigation";
import { Logo } from "./Logo";
import { NavLink } from "./NavLink";

/** The public footer: text from Website Content > Footer, menu from Navigation Management. */
export async function Footer() {
  const [{ site, footer }, menu] = await Promise.all([getContent(), getMenu("footer")]);
  return <FooterView site={site} footer={footer} menu={menu} />;
}

/** The footer itself, given its content (the admin preview passes the draft). */
export function FooterView({
  site,
  footer,
  menu,
}: {
  site: SiteContent["site"];
  footer: SiteContent["footer"];
  menu: MenuItem[];
}) {
  const details = [
    footer.email && { label: footer.email, href: `mailto:${footer.email}` },
    footer.phone && { label: footer.phone, href: `tel:${footer.phone.replace(/[^\d+]/g, "")}` },
  ].filter((item): item is { label: string; href: string } => Boolean(item));
  const showDetails = footer.showContactDetails && (details.length > 0 || Boolean(footer.address));
  const social = footer.socialLinks.filter((link) => link.label && isSafeHref(link.href));
  const showMenu = footer.showNavigation && menu.length > 0;

  return (
    <footer className="bg-navy-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.2fr_1fr]">
        <div>
          <Link href="/" aria-label="ENERDI home" className="inline-block">
            <Logo tone="light" />
          </Link>
          <p className="mt-4 font-mono text-xs tracking-[0.18em] text-sky-soft uppercase">
            {site.meaning.join(" · ")}
          </p>
          {footer.description && (
            <p className="mt-4 max-w-sm text-[0.95rem] leading-relaxed text-white/70">
              {footer.description}
            </p>
          )}

          {showDetails && (
            <address className="mt-6 grid gap-1.5 text-[0.95rem] text-white/80 not-italic">
              {details.map((item) => (
                <a key={item.href} href={item.href} className="hover:text-sky-brand">
                  {item.label}
                </a>
              ))}
              {footer.address && <span className="whitespace-pre-line">{footer.address}</span>}
            </address>
          )}

          {footer.showSocialLinks && social.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {social.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-md border border-white/30 px-4 py-1.5 text-sm font-medium text-white/85 transition-colors hover:border-sky-brand hover:text-sky-brand"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {showMenu && (
          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-8 gap-y-3 text-[0.95rem]">
              {menu.map((item, index) => (
                <li key={index}>
                  <NavLink
                    href={item.href}
                    newTab={item.newTab}
                    className="text-white/80 transition-colors hover:text-sky-brand"
                  >
                    {item.label}
                  </NavLink>
                  {item.children.length > 0 && (
                    <ul className="mt-2 grid gap-2 border-l border-white/15 pl-3">
                      {item.children.map((child, n) => (
                        <li key={n}>
                          <NavLink
                            href={child.href}
                            newTab={child.newTab}
                            className="text-sm text-white/60 transition-colors hover:text-sky-brand"
                          >
                            {child.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {footer.copyright && (
        <div className="border-t border-white/10">
          <p className="mx-auto max-w-7xl px-5 py-5 font-mono text-xs text-white/50 sm:px-8">
            {footer.copyright}
          </p>
        </div>
      )}
    </footer>
  );
}
