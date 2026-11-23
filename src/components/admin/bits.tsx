import Link from "next/link";
import { ui } from "./ui";

const statusLooks = {
  published: { label: "Published", box: "bg-emerald-50 text-emerald-800", dot: "bg-emerald-500" },
  draft: { label: "Draft", box: "bg-amber-50 text-amber-800", dot: "bg-amber-400" },
  unpublished: { label: "Unpublished", box: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
  new: { label: "New", box: "bg-sky-50 text-sky-800", dot: "bg-sky-500" },
  in_progress: { label: "In progress", box: "bg-amber-50 text-amber-800", dot: "bg-amber-400" },
  completed: { label: "Completed", box: "bg-emerald-50 text-emerald-800", dot: "bg-emerald-500" },
};

export function StatusBadge({ status }: { status: keyof typeof statusLooks }) {
  const look = statusLooks[status];
  return (
    <span className={`inline-flex items-center gap-2 px-2 py-1 font-mono text-xs tracking-[0.12em] whitespace-nowrap uppercase ${look.box}`}>
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${look.dot}`} />
      {look.label}
    </span>
  );
}

/** "Previous / Page 2 of 5 / Next". `href` builds the address of a page number. */
export function Pagination({
  page,
  total,
  pageSize,
  href,
}: {
  page: number;
  total: number;
  pageSize: number;
  href: (page: number) => string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pages" className="mt-6 flex items-center justify-between gap-4">
      {page > 1 ? (
        <Link href={href(page - 1)} className={ui.small}>
          ← Previous
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm text-muted">
        Page {page} of {pages} · {total} in total
      </p>
      {page < pages ? (
        <Link href={href(page + 1)} className={ui.small}>
          Next →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

/** A search box and a status dropdown that filter a list through the address bar. */
export function FilterBar({
  search,
  status,
  statuses,
  placeholder,
  children,
}: {
  search: string;
  status: string;
  statuses: { value: string; label: string }[];
  placeholder: string;
  children?: React.ReactNode;
}) {
  return (
    <form className={`${ui.card} mb-4 flex flex-wrap items-end gap-3 p-4`}>
      <label className="min-w-48 flex-1 text-sm font-semibold text-navy-800">
        Search
        <input type="search" name="q" defaultValue={search} placeholder={placeholder} className={`${ui.input} mt-1`} />
      </label>
      <label className="text-sm font-semibold text-navy-800">
        Status
        <select name="status" defaultValue={status} className={`${ui.input} mt-1`}>
          <option value="">All</option>
          {statuses.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className={ui.secondary}>
        Apply
      </button>
      {children}
    </form>
  );
}

export const publishStatuses = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "unpublished", label: "Unpublished" },
];

/** Reads one value from a page's search parameters as plain text. */
export function param(value: string | string[] | undefined, max = 100) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function pageNumber(value: string | string[] | undefined) {
  const page = Number(param(value));
  return Number.isInteger(page) && page > 0 && page < 100000 ? page : 1;
}

export function formatDateTime(date: Date | string | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(new Date(date));
}
