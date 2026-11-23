import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { getAdmin } from "@/lib/auth";
import { query } from "@/lib/db";

const panelClass =
  "absolute top-full right-0 z-40 mt-2 w-72 border border-line bg-white shadow-[0_18px_40px_rgba(0,32,91,0.14)]";

/** What is waiting for the admin: new enquiries and unpublished work. */
async function notifications() {
  const [row] = await query<{ enquiries: string; drafts: string; sections: string }>(
    `SELECT
       (SELECT count(*) FROM contact_enquiries WHERE status = 'new') AS enquiries,
       (SELECT count(*) FROM posts WHERE status = 'draft') AS drafts,
       (SELECT count(*) FROM site_content WHERE draft IS NOT NULL) AS sections`,
  );
  return [
    { count: Number(row.enquiries), one: "new enquiry", many: "new enquiries", href: "/admin/enquiries?status=new" },
    { count: Number(row.drafts), one: "draft article or post", many: "draft articles and posts", href: "/admin/posts/articles?status=draft" },
    { count: Number(row.sections), one: "page section with an unpublished draft", many: "page sections with unpublished drafts", href: "/admin/content/home" },
  ].filter((item) => item.count > 0);
}

/** The right-hand end of the top bar. Rendered per request, behind the layout's Suspense. */
export async function Topbar() {
  const admin = await getAdmin();
  if (!admin) return null;

  let items: Awaited<ReturnType<typeof notifications>> = [];
  try {
    items = await notifications();
  } catch (error) {
    console.error("Admin: notifications could not be loaded.", error);
  }
  const total = items.reduce((sum, item) => sum + item.count, 0);
  const initials = (admin.name || admin.email).slice(0, 2).toUpperCase();

  return (
    <div className="flex shrink-0 items-center gap-2">
      <details className="relative">
        <summary
          aria-label={`Notifications: ${total}`}
          className="relative flex h-10 w-10 cursor-pointer list-none items-center justify-center border border-line text-navy-800 hover:border-navy-800 [&::-webkit-details-marker]:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path d="M6 16V11a6 6 0 1112 0v5l2 2H4zM10 20a2 2 0 004 0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          </svg>
          {total > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-brand px-1 font-mono text-[0.7rem] font-medium text-navy-950">
              {total}
            </span>
          )}
        </summary>
        <div className={panelClass}>
          <p className="border-b border-line px-4 py-3 font-mono text-xs tracking-[0.14em] text-muted uppercase">
            Notifications
          </p>
          {items.length === 0 ? (
            <p className="px-4 py-4 text-[0.95rem] text-muted">Nothing is waiting for you.</p>
          ) : (
            <ul>
              {items.map((item) => (
                <li key={item.href} className="border-b border-line last:border-b-0">
                  <Link href={item.href} className="block px-4 py-3 text-[0.95rem] text-ink hover:bg-paper">
                    <span className="font-semibold text-navy-800">{item.count}</span>{" "}
                    {item.count === 1 ? item.one : item.many}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </details>

      <details className="relative">
        <summary className="flex cursor-pointer list-none items-center gap-2.5 border border-line py-1 pr-3 pl-1 hover:border-navy-800 [&::-webkit-details-marker]:hidden">
          <span className="flex h-8 w-8 items-center justify-center bg-navy-800 font-mono text-xs font-medium text-white">
            {initials}
          </span>
          <span className="hidden max-w-32 truncate text-[0.95rem] font-semibold text-navy-800 sm:block">
            {admin.name || admin.email}
          </span>
        </summary>
        <div className={panelClass}>
          <div className="border-b border-line px-4 py-3">
            <p className="truncate font-semibold text-navy-800">{admin.name}</p>
            <p className="truncate text-sm text-muted">{admin.email}</p>
            <p className="mt-1 font-mono text-[0.7rem] tracking-[0.14em] text-navy-700 uppercase">
              {admin.role === "owner" ? "Primary administrator" : "Administrator"}
            </p>
          </div>
          <Link href="/admin/account" className="block px-4 py-3 text-[0.95rem] text-ink hover:bg-paper">
            Account and password
          </Link>
          <Link href="/" target="_blank" className="block px-4 py-3 text-[0.95rem] text-ink hover:bg-paper">
            View the website ↗
          </Link>
          <form action={logout} className="border-t border-line">
            <button type="submit" className="block w-full px-4 py-3 text-left text-[0.95rem] font-semibold text-navy-800 hover:bg-paper">
              Sign out
            </button>
          </form>
        </div>
      </details>
    </div>
  );
}
