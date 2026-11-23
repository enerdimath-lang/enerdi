import { contentPages } from "@/content/sections";

export type AdminLink = {
  label: string;
  href: string;
  /** An SVG path drawn in a 24 x 24 box. */
  icon: string;
  children?: { label: string; href: string }[];
};

/** The admin sidebar, top to bottom. */
export const adminLinks: AdminLink[] = [
  { label: "Dashboard", href: "/admin", icon: "M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-4H4zM14 8h6V4h-6z" },
  {
    label: "Website Content",
    href: "/admin/content",
    icon: "M5 4h14v16H5zM8 8h8M8 12h8M8 16h5",
    children: contentPages.map((page) => ({
      label: page.label,
      href: `/admin/content/${page.slug}`,
    })),
  },
  { label: "Products Management", href: "/admin/catalog/products", icon: "M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8" },
  { label: "Services Management", href: "/admin/catalog/services", icon: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18M12 9a3 3 0 100 6 3 3 0 000-6z" },
  { label: "Articles Management", href: "/admin/posts/articles", icon: "M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7" },
  { label: "Blog Management", href: "/admin/posts/blog", icon: "M4 20l1-5L16 4l4 4L9 19zM13 7l4 4" },
  { label: "Media Library", href: "/admin/media", icon: "M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M9 9.5a1 1 0 100-2 1 1 0 000 2z" },
  { label: "Contact Enquiries", href: "/admin/enquiries", icon: "M4 6h16v12H4zM4 7l8 6 8-6" },
  { label: "Navigation Management", href: "/admin/navigation", icon: "M4 6h16M4 12h10M4 18h16M18 9l3 3-3 3" },
  { label: "SEO Management", href: "/admin/seo", icon: "M11 4a7 7 0 105 12l4 4M11 8v6M8 11h6" },
  { label: "Website Settings", href: "/admin/settings", icon: "M4 7h10M18 7h2M4 17h2M10 17h10M16 5v4M8 15v4" },
  { label: "Admin Users", href: "/admin/users", icon: "M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM3 20c0-3.3 2.7-6 6-6s6 2.700 6 6M17 11a3 3 0 100-6M18 14c2 .700 3.500 3 3.500 6" },
  { label: "Activity Logs", href: "/admin/activity", icon: "M12 7v5l3 2M12 21a9 9 0 100-18 9 9 0 000 18z" },
];

/** The heading shown in the top bar for the page being viewed. */
export function titleFor(pathname: string) {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/account")) return "Your account";
  if (pathname.startsWith("/admin/search")) return "Search";
  for (const link of adminLinks) {
    if (link.href === "/admin") continue;
    const child = link.children?.find((item) => pathname.startsWith(item.href));
    if (child) return `${link.label}: ${child.label}`;
    if (pathname.startsWith(link.href)) return link.label;
  }
  return "Admin";
}
