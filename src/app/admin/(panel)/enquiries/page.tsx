import { deleteEnquiryAction, setEnquiryStatusAction } from "@/app/admin/actions";
import {
  FilterBar,
  formatDateTime,
  pageNumber,
  Pagination,
  param,
  StatusBadge,
} from "@/components/admin/bits";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { PageTitle } from "@/components/admin/PageTitle";
import { ui } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import {
  ENQUIRY_PAGE_SIZE,
  enquiryStatuses,
  isEnquiryStatus,
  listEnquiries,
} from "@/lib/enquiries";

// Waits for the session check on the server instead of showing a prefetched page.
export const instant = false;

export default async function EnquiriesPage({ searchParams }: PageProps<"/admin/enquiries">) {
  await requireAdmin();
  const query = await searchParams;
  const search = param(query.q);
  const statusParam = param(query.status);
  const status = isEnquiryStatus(statusParam) ? statusParam : undefined;
  const page = pageNumber(query.page);
  const { rows, total } = await listEnquiries({ status, search }, page);
  const filter = new URLSearchParams({ q: search, status: status ?? "" });

  return (
    <>
      <PageTitle
        eyebrow="Inbox"
        title="Contact Enquiries"
        intro="Everything sent through the contact form. Only admins can see this."
      >
        {/* A plain link: the browser downloads the file. */}
        <a href={`/admin/api/enquiries?${filter}`} className={ui.secondary}>
          Export to CSV
        </a>
      </PageTitle>

      <FilterBar search={search} status={status ?? ""} statuses={enquiryStatuses} placeholder="Name, email, phone or message" />

      {rows.length === 0 ? (
        <div className={`${ui.card} p-10 text-center text-lg text-muted`}>
          {search || status ? "No enquiries match that search." : "No enquiries yet."}
        </div>
      ) : (
        <ul className="grid gap-3">
          {rows.map((enquiry) => (
            <li key={enquiry.id} className={ui.card}>
              <details open={enquiry.status === "new"}>
                <summary className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
                  <StatusBadge status={enquiry.status} />
                  <span className="min-w-0 flex-1 truncate font-semibold text-navy-800">
                    {enquiry.name}
                    {enquiry.company && <span className="font-normal text-muted"> · {enquiry.company}</span>}
                  </span>
                  <span className="text-sm text-muted">{formatDateTime(enquiry.created_at)}</span>
                </summary>
                <div className="grid gap-5 border-t border-line p-5 lg:grid-cols-[1fr_16rem]">
                  <div>
                    <dl className="grid gap-x-6 gap-y-2 text-[0.95rem] sm:grid-cols-[6rem_1fr]">
                      <dt className="font-mono text-xs tracking-[0.12em] text-muted uppercase sm:pt-1">Email</dt>
                      <dd>
                        <a href={`mailto:${enquiry.email}`} className="font-semibold text-navy-800 underline decoration-sky-brand decoration-2 underline-offset-4">
                          {enquiry.email}
                        </a>
                      </dd>
                      <dt className="font-mono text-xs tracking-[0.12em] text-muted uppercase sm:pt-1">Phone</dt>
                      <dd>
                        {enquiry.phone ? (
                          <a href={`tel:${enquiry.phone.replace(/[^\d+]/g, "")}`} className="text-ink underline underline-offset-4">
                            {enquiry.phone}
                          </a>
                        ) : (
                          <span className="text-muted">Not given</span>
                        )}
                      </dd>
                      <dt className="font-mono text-xs tracking-[0.12em] text-muted uppercase sm:pt-1">Email copy</dt>
                      <dd className="text-muted">
                        {enquiry.email_sent ? "Also emailed to the office" : "Not emailed, stored here only"}
                      </dd>
                    </dl>
                    <p className="mt-4 border-l-[5px] border-sky-brand bg-paper px-4 py-3 leading-relaxed whitespace-pre-wrap text-ink">
                      {enquiry.message}
                    </p>
                  </div>
                  <div className="grid content-start gap-3">
                    <form action={setEnquiryStatusAction} className="grid gap-2">
                      <input type="hidden" name="id" value={enquiry.id} />
                      <label className={ui.label}>
                        Status
                        <select name="status" defaultValue={enquiry.status} className={ui.input}>
                          {enquiryStatuses.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button type="submit" className={ui.primary}>
                        Update status
                      </button>
                    </form>
                    <form action={deleteEnquiryAction}>
                      <input type="hidden" name="id" value={enquiry.id} />
                      <ConfirmButton label="Delete enquiry" question="Delete for good?" />
                    </form>
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}

      <Pagination
        page={page}
        total={total}
        pageSize={ENQUIRY_PAGE_SIZE}
        href={(n) => `/admin/enquiries?${new URLSearchParams({ q: search, status: status ?? "", page: String(n) })}`}
      />
    </>
  );
}
