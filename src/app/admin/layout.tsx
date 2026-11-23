import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | ENERDI admin" },
  // The admin panel has no business in search results.
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen flex-1 flex-col bg-paper">{children}</div>;
}
