import "server-only";
import { query } from "./db";

export type EnquiryStatus = "new" | "in_progress" | "completed";

export const enquiryStatuses: { value: EnquiryStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

export function isEnquiryStatus(value: unknown): value is EnquiryStatus {
  return enquiryStatuses.some((status) => status.value === value);
}

export type EnquiryRecord = {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  status: EnquiryStatus;
  email_sent: boolean;
  created_at: Date;
};

const COLUMNS = "id, name, email, phone, company, message, status, email_sent, created_at";

/** Called by the public contact form. Returns the new enquiry's id. */
export async function storeEnquiry(input: {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}) {
  const [row] = await query<{ id: number }>(
    `INSERT INTO contact_enquiries (name, email, phone, company, message)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [input.name, input.email, input.phone, input.company, input.message],
  );
  return row.id;
}

export async function markEnquiryEmailed(id: number) {
  await query("UPDATE contact_enquiries SET email_sent = true WHERE id = $1", [id]);
}

export const ENQUIRY_PAGE_SIZE = 25;

type Filter = { status?: EnquiryStatus; search?: string };

function where({ status, search }: Filter) {
  const clauses: string[] = [];
  const values: unknown[] = [];
  if (status) {
    values.push(status);
    clauses.push(`status = $${values.length}`);
  }
  if (search) {
    values.push(`%${search.replace(/[%_\\]/g, "\\$&")}%`);
    const n = values.length;
    clauses.push(
      `(name ILIKE $${n} OR email ILIKE $${n} OR phone ILIKE $${n} OR company ILIKE $${n} OR message ILIKE $${n})`,
    );
  }
  return { sql: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", values };
}

export async function listEnquiries(filter: Filter, page = 1) {
  const { sql, values } = where(filter);
  const [rows, [{ count }]] = await Promise.all([
    query<EnquiryRecord>(
      `SELECT ${COLUMNS} FROM contact_enquiries ${sql}
       ORDER BY created_at DESC, id DESC
       LIMIT ${ENQUIRY_PAGE_SIZE} OFFSET ${(Math.max(1, page) - 1) * ENQUIRY_PAGE_SIZE}`,
      values,
    ),
    query<{ count: string }>(`SELECT count(*) FROM contact_enquiries ${sql}`, values),
  ]);
  return { rows, total: Number(count) };
}

/** Everything matching the filter, for the CSV download. */
export async function allEnquiries(filter: Filter) {
  const { sql, values } = where(filter);
  return query<EnquiryRecord>(
    `SELECT ${COLUMNS} FROM contact_enquiries ${sql} ORDER BY created_at DESC, id DESC LIMIT 20000`,
    values,
  );
}

export async function setEnquiryStatus(id: number, status: EnquiryStatus) {
  await query(
    "UPDATE contact_enquiries SET status = $2, updated_at = now() WHERE id = $1",
    [id, status],
  );
}

export async function deleteEnquiry(id: number) {
  await query("DELETE FROM contact_enquiries WHERE id = $1", [id]);
}

export async function countEnquiries() {
  const [row] = await query<{ total: string; fresh: string }>(
    "SELECT count(*) AS total, count(*) FILTER (WHERE status = 'new') AS fresh FROM contact_enquiries",
  );
  return { total: Number(row.total), fresh: Number(row.fresh) };
}

/** One CSV cell. A leading =, +, - or @ is defused so spreadsheets do not run it as a formula. */
function cell(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function enquiriesToCsv(rows: EnquiryRecord[]) {
  const label = (status: EnquiryStatus) =>
    enquiryStatuses.find((item) => item.value === status)?.label ?? status;
  const lines = [
    ["Received", "Status", "Name", "Email", "Phone", "Company", "Message"].map(cell).join(","),
    ...rows.map((row) =>
      [
        new Date(row.created_at).toISOString(),
        label(row.status),
        row.name,
        row.email,
        row.phone,
        row.company,
        row.message,
      ]
        .map(cell)
        .join(","),
    ),
  ];
  // The leading mark makes Excel read accented letters correctly.
  return `﻿${lines.join("\r\n")}\r\n`;
}
