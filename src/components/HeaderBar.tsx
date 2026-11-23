"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import type { MenuItem } from "@/lib/navigation";
import { Logo } from "./Logo";
import { NavLink } from "./NavLink";

function isActive(pathname: string | null, item: MenuItem): boolean {
  if (pathname === null) return false;
  const own =
    item.href === "/"
      ? pathname === "/"
      : item.href.startsWith("/") && pathname.startsWith(item.href);
  return own || item.children.some((child) => isActive(pathname, child));
}

/**
 * On article and blog post pages the address is only known once the request
 * arrives. Until then the header shows without a highlighted link, so the
 * rest of the page never waits for it.
 */
export function HeaderBar({ items }: { items: MenuItem[] }) {
  return (
    <Suspense fallback={<Bar items={items} pathname={null} />}>
      <BarForThisPage items={items} />
    </Suspense>
  );
}

function BarForThisPage({ items }: { items: MenuItem[] }) {
  return <Bar items={items} pathname={usePathname()} />;
}

function Bar({ items, pathname }: { items: MenuItem[]; pathname: string | null }) {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState<number | null>(null);

  // A link to the contact page, if the menu has one, is shown as the button.
  const contactLink = items.find(
    (item) => item.href === "/contact" && item.children.length === 0,
  );
  const links = items.filter((item) => item !== contactLink);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link
          href="/"
          aria-label="ENERDI home"
          onClick={() => setOpen(false)}
          className="shrink-0"
        >
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 xl:flex">
          {links.map((item, index) => {
            const active = isActive(pathname, item);
            const linkClass = `relative flex items-center gap-1.5 px-3 py-2 text-[0.95rem] font-medium transition-colors hover:text-navy-800 ${
              active ? "text-navy-800" : "text-muted"
            }`;
            const underline = (
              <span
                aria-hidden="true"
                className={`absolute inset-x-3 -bottom-[1.05rem] h-[3px] bg-sky-brand transition-opacity ${
                  active ? "opacity-100" : "opacity-0"
                }`}
              />
            );

            if (item.children.length === 0) {
              return (
                <NavLink
                  key={index}
                  href={item.href}
                  newTab={item.newTab}
                  aria-current={active ? "page" : undefined}
                  className={linkClass}
                >
                  {item.label}
                  {underline}
                </NavLink>
              );
            }

            const expanded = dropdown === index;
            return (
              <div
                key={index}
                className="relative"
                onMouseEnter={() => setDropdown(index)}
                onMouseLeave={() => setDropdown(null)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) setDropdown(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setDropdown(null);
                }}
              >
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-haspopup="true"
                  className={linkClass}
                  onClick={() => setDropdown(expanded ? null : index)}
                >
                  {item.label}
                  <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
                    <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                  {underline}
                </button>
                {expanded && (
                  // The padding bridges the gap so the pointer can travel to the list.
                  <div className="absolute top-full left-0 z-50 pt-[1.05rem]">
                    <ul className="min-w-56 border border-line border-t-[3px] border-t-sky-brand bg-white py-2 shadow-[0_18px_40px_rgba(0,32,91,0.12)]">
                      {[{ ...item, children: [] }, ...item.children].map((child, n) => (
                        <li key={n}>
                          <NavLink
                            href={child.href}
                            newTab={child.newTab}
                            onClick={() => setDropdown(null)}
                            className="block px-5 py-2.5 text-[0.95rem] font-medium text-muted hover:bg-paper hover:text-navy-800"
                          >
                            {n === 0 ? `All: ${child.label}` : child.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
          {contactLink && (
            <NavLink
              href={contactLink.href}
              newTab={contactLink.newTab}
              className="ml-3 bg-navy-800 px-5 py-2.5 text-[0.95rem] font-semibold text-white transition-colors hover:bg-navy-700"
            >
              {contactLink.label}
            </NavLink>
          )}
        </nav>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center border border-line text-navy-800 xl:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" fill="none" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" fill="none" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="max-h-[calc(100vh-4.5rem)] overflow-y-auto border-t border-line bg-white xl:hidden"
        >
          <ul className="mx-auto max-w-7xl px-5 py-3 sm:px-8">
            {items.map((item, index) => {
              const active = isActive(pathname, item);
              return (
                <li key={index} className="border-b border-line/70 last:border-b-0">
                  <NavLink
                    href={item.href}
                    newTab={item.newTab}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 py-3.5 text-base font-medium ${
                      active ? "text-navy-800" : "text-muted"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-2 w-5 ${active ? "bg-sky-brand" : "bg-line"}`}
                    />
                    {item.label}
                  </NavLink>
                  {item.children.length > 0 && (
                    <ul className="pb-3 pl-8">
                      {item.children.map((child, n) => (
                        <li key={n}>
                          <NavLink
                            href={child.href}
                            newTab={child.newTab}
                            onClick={() => setOpen(false)}
                            className="block py-2 text-[0.95rem] text-muted hover:text-navy-800"
                          >
                            {child.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
