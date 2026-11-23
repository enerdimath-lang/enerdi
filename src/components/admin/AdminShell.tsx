"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { LogoMark } from "@/components/Logo";
import { adminLinks, titleFor, type AdminLink } from "./nav";

const STORAGE_KEY = "enerdi-admin-sidebar";

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function isCurrent(pathname: string | null, href: string) {
  if (pathname === null) return false;
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

function SidebarLink({
  link,
  pathname,
  collapsed,
  onNavigate,
}: {
  link: AdminLink;
  pathname: string | null;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const active = isCurrent(pathname, link.href);
  const [open, setOpen] = useState(false);
  const expanded = open || active;
  const rowClass = `flex w-full items-center gap-3 px-3 py-2.5 text-left text-[0.92rem] font-medium transition-colors ${
    active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
  } ${collapsed ? "lg:justify-center lg:px-0" : ""}`;
  const label = <span className={collapsed ? "lg:sr-only" : ""}>{link.label}</span>;

  if (!link.children) {
    return (
      <li>
        <Link
          href={link.href}
          title={collapsed ? link.label : undefined}
          aria-current={active ? "page" : undefined}
          className={rowClass}
          onClick={onNavigate}
        >
          <Icon path={link.icon} />
          {label}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        title={collapsed ? link.label : undefined}
        aria-expanded={expanded}
        className={rowClass}
        onClick={() => setOpen(!expanded)}
      >
        <Icon path={link.icon} />
        {label}
        <svg
          viewBox="0 0 12 12"
          aria-hidden="true"
          className={`ml-auto h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""} ${collapsed ? "lg:hidden" : ""}`}
        >
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </button>
      {expanded && (
        <ul className={`mb-1 border-l border-white/15 ${collapsed ? "ml-5 lg:ml-0 lg:border-0" : "ml-5"}`}>
          {link.children.map((child) => {
            const current = isCurrent(pathname, child.href);
            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  title={collapsed ? child.label : undefined}
                  aria-current={current ? "page" : undefined}
                  onClick={onNavigate}
                  className={`block py-2 pr-3 pl-4 text-[0.9rem] transition-colors ${
                    current ? "font-semibold text-sky-brand" : "text-white/65 hover:text-white"
                  } ${collapsed ? "lg:px-0 lg:text-center lg:text-xs" : ""}`}
                >
                  {collapsed ? (
                    <>
                      <span className="lg:hidden">{child.label}</span>
                      <span className="hidden lg:inline" aria-hidden="true">
                        {child.label.slice(0, 2)}
                      </span>
                    </>
                  ) : (
                    child.label
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

function Frame({
  pathname,
  topbar,
  children,
}: {
  pathname: string | null;
  topbar: React.ReactNode;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Remembers the choice on this computer. Read after the first paint, so the
  // page the server sent and the page the browser builds start out the same.
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (window.localStorage.getItem(STORAGE_KEY) === "collapsed") setCollapsed(true);
    } catch {
      // Storage can be blocked; the sidebar then simply starts open.
    }
  }, []);

  function toggle() {
    setCollapsed((value) => {
      try {
        window.localStorage.setItem(STORAGE_KEY, value ? "open" : "collapsed");
      } catch {
        // Not remembered, still toggled.
      }
      return !value;
    });
  }

  return (
    <div className="flex min-h-screen flex-1">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-navy-950/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-navy-950 text-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:transition-[width] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-[4.5rem]" : "lg:w-72"}`}
      >
        <div className={`flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-4 ${collapsed ? "lg:justify-center lg:px-0" : ""}`}>
          <Link href="/admin" aria-label="Admin dashboard" className="flex items-center gap-3">
            <LogoMark className="h-8 w-8 shrink-0 outline outline-1 outline-white/25" />
            <span className={`font-display text-xl font-extrabold tracking-[0.04em] [font-stretch:112%] ${collapsed ? "lg:hidden" : ""}`}>
              E<span className="text-sky-brand">N</span>ER<span className="text-sky-brand">D</span>I
              <span className="ml-2 font-mono text-[0.65rem] font-normal tracking-[0.18em] text-sky-soft uppercase">
                Admin
              </span>
            </span>
          </Link>
        </div>

        <nav aria-label="Admin" className="flex-1 overflow-y-auto px-2 py-3">
          <ul className="grid gap-0.5">
            {adminLinks.map((link) => (
              <SidebarLink
                key={link.href}
                link={link}
                pathname={pathname}
                collapsed={collapsed}
                onNavigate={() => setMobileOpen(false)}
              />
            ))}
          </ul>
        </nav>

        <div className="hidden border-t border-white/10 p-2 lg:block">
          <button
            type="button"
            onClick={toggle}
            aria-pressed={collapsed}
            className={`flex w-full items-center gap-3 px-3 py-2.5 text-[0.92rem] text-white/70 hover:bg-white/5 hover:text-white ${collapsed ? "justify-center px-0" : ""}`}
          >
            <svg viewBox="0 0 24 24" className={`h-5 w-5 shrink-0 transition-transform ${collapsed ? "rotate-180" : ""}`} aria-hidden="true">
              <path d="M14 6l-6 6 6 6M19 5v14" fill="none" stroke="currentColor" strokeWidth="1.7" />
            </svg>
            <span className={collapsed ? "sr-only" : ""}>
              {collapsed ? "Expand sidebar" : "Collapse sidebar"}
            </span>
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-white px-4 sm:px-6">
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center border border-line text-navy-800 lg:hidden"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </button>
          <p className="hidden min-w-0 truncate font-display text-lg font-extrabold text-navy-800 [font-stretch:112%] md:block">
            {pathname ? titleFor(pathname) : "Admin"}
          </p>
          <form action="/admin/search" role="search" className="ml-auto w-full max-w-xs md:max-w-sm">
            <label className="sr-only" htmlFor="admin-search">
              Search the admin panel
            </label>
            <input
              id="admin-search"
              type="search"
              name="q"
              placeholder="Search content and enquiries"
              className="block w-full border border-line bg-paper px-3.5 py-2 text-[0.95rem] text-ink placeholder:text-muted/70 focus:border-navy-800 focus:bg-white focus:outline-none"
            />
          </form>
          {topbar}
        </header>

        <main id="main" className="min-w-0 flex-1 px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

function FrameForThisPage(props: { topbar: React.ReactNode; children: React.ReactNode }) {
  return <Frame pathname={usePathname()} {...props} />;
}

/**
 * The frame around every admin page: collapsible sidebar on the left, top
 * bar with search, notifications and the signed-in admin, then the page.
 */
export function AdminShell(props: { topbar: React.ReactNode; children: React.ReactNode }) {
  return (
    <Suspense fallback={<Frame pathname={null} {...props} />}>
      <FrameForThisPage {...props} />
    </Suspense>
  );
}
