import { formatDateTime, pageNumber, Pagination } from "@/components/admin/bits";
import { PageTitle } from "@/components/admin/PageTitle";
import { ui } from "@/components/admin/ui";
import { ACTIVITY_PAGE_SIZE, listActivity } from "@/lib/activity";
import { requireAdmin } from "@/lib/auth";

// Waits for the session check on the server instead of showing a prefetched page.
export const instant = false;

export default async function ActivityPage({ searchParams }: PageProps<"/admin/activity">) {
  await requireAdmin();
  const page = pageNumber((await searchParams).page);
  const { rows, total } = await listActivity(page);

  return (
    <>
      <PageTitle
        eyebrow="History"
        title="Activity Logs"
        intro="Who changed what, newest first. Entries cannot be edited or removed from here."
      />
      {rows.length === 0 ? (
        <div className={`${ui.card} p-10 text-center text-lg text-muted`}>No activity yet.</div>
      ) : (
        <div className={`${ui.card} overflow-x-auto`}>
          <table className="w-full min-w-[40rem] text-left text-[0.95rem]">
            <thead className="border-b border-line bg-paper font-mono text-xs tracking-[0.12em] text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Admin</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Where</th>
                <th className="px-4 py-3 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((entry) => (
                <tr key={entry.id} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3 whitespace-nowrap text-muted">{formatDateTime(entry.created_at)}</td>
                  <td className="px-4 py-3 text-muted">{entry.admin_email || "—"}</td>
                  <td className="px-4 py-3 font-semibold text-navy-800">{entry.action}</td>
                  <td className="px-4 py-3 text-ink">{entry.entity}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-muted">{entry.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} total={total} pageSize={ACTIVITY_PAGE_SIZE} href={(n) => `/admin/activity?page=${n}`} />
    </>
  );
}
