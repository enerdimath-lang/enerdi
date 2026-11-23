import type { Metadata } from "next";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/manrope/index.css";
import "@fontsource-variable/inter/index.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";
import { site } from "@/content/site";

/** The public address, used for the links that social networks preview. */
function siteUrl() {
  try {
    return new URL(process.env.SITE_URL?.trim() || "http://localhost:3000");
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: {
    default: `${site.name} | ${site.meaning.join(", ")}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
};

/**
 * The shell shared by everything. The public pages add the header and footer
 * in `(site)/layout.tsx`; the admin panel has its own frame in `admin/`.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
