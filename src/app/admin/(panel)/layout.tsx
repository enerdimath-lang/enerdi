import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Topbar } from "@/components/admin/Topbar";

/**
 * The frame around every admin page. It holds no private data itself: each
 * page checks the session before it reads or shows anything, and the top bar
 * shows nothing until the session is confirmed.
 */
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell
      topbar={
        <Suspense fallback={<div className="h-10 w-24 shrink-0 bg-paper" />}>
          <Topbar />
        </Suspense>
      }
    >
      {children}
    </AdminShell>
  );
}
