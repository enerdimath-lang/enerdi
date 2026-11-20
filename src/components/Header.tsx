"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navigation } from "@/content/site";
import { Logo } from "./Logo";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = navigation.filter((item) => item.href !== "/contact");
  const contactLink = navigation.find((item) => item.href === "/contact");

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
          {links.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative px-3 py-2 text-[0.95rem] font-medium transition-colors hover:text-navy-800 ${
                  active ? "text-navy-800" : "text-muted"
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-3 -bottom-[1.05rem] h-[3px] bg-sky-brand transition-opacity ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                />
              </Link>
            );
          })}
          {contactLink && (
            <Link
              href={contactLink.href}
              className="ml-3 bg-navy-800 px-5 py-2.5 text-[0.95rem] font-semibold text-white transition-colors hover:bg-navy-700"
            >
              {contactLink.label}
            </Link>
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
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="border-t border-line bg-white xl:hidden"
        >
          <ul className="mx-auto max-w-7xl px-5 py-3 sm:px-8">
            {navigation.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 border-b border-line/70 py-3.5 text-base font-medium last:border-b-0 ${
                      active ? "text-navy-800" : "text-muted"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-2 w-5 ${
                        active ? "bg-sky-brand" : "bg-line"
                      }`}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
