import Link from "next/link";
import { formatDateTime } from "@/components/admin/bits";
import { PageTitle } from "@/components/admin/PageTitle";
import { ui } from "@/components/admin/ui";
import { CreateAdminForm, ManageAdmin } from "@/components/admin/UserForms";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";

// Waits for the session check on the server instead of showing a prefetched page.
export const instant = false;

type UserRow = {
  id: number;
  email: string;
  name: string;
  role: "owner" | "admin";
  disabled: boolean;
  last_login_at: Date | null;
  created_at: Date;
};

export default async function UsersPage() {
  const admin = await requireAdmin();
  const users = await query<UserRow>(
    "SELECT id, email, name, role, disabled, last_login_at, created_at FROM admin_users ORDER BY role DESC, id",
  );
  const isOwner = admin.role === "owner";

  return (
    <>
      <PageTitle
        eyebrow="Access"
        title="Admin Users"
        intro={
          isOwner
            ? "People who can sign in to this admin panel. There is no public registration: only you can add them."
            : "People who can sign in to this admin panel. Only the primary administrator can add or change them."
        }
      />

      <ul className="grid gap-3">
        {users.map((user) => (
          <li key={user.id} className={`${ui.card} grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-start`}>
            <div>
              <p className="flex flex-wrap items-center gap-3">
                <span className="text-lg font-extrabold text-navy-800">{user.name || user.email}</span>
                <span className="bg-paper px-2 py-1 font-mono text-xs tracking-[0.12em] text-navy-700 uppercase">
                  {user.role === "owner" ? "Primary administrator" : "Administrator"}
                </span>
                {user.disabled && (
                  <span className="bg-red-50 px-2 py-1 font-mono text-xs tracking-[0.12em] text-red-800 uppercase">
                    Disabled
                  </span>
                )}
                {user.id === admin.id && <span className="text-sm text-muted">(you)</span>}
              </p>
              <p className="mt-1 text-muted">{user.email}</p>
              <p className="mt-1 text-sm text-muted">
                {user.last_login_at ? `Last signed in ${formatDateTime(user.last_login_at)}` : "Has not signed in yet"}
              </p>
            </div>
            {user.id === admin.id ? (
              <Link href="/admin/account" className={ui.small}>
                Your account
              </Link>
            ) : (
              isOwner && user.role !== "owner" && <ManageAdmin id={user.id} disabled={user.disabled} />
            )}
          </li>
        ))}
      </ul>

      {isOwner && (
        <section className={`${ui.card} mt-6 border-t-[5px] border-t-sky-brand p-6`}>
          <h2 className="mb-4 text-xl font-extrabold text-navy-800">Add an administrator</h2>
          <CreateAdminForm />
        </section>
      )}
    </>
  );
}
