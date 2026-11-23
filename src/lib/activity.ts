import "server-only";
import { query } from "./db";

export type Activity = {
  id: string;
  admin_email: string;
  action: string;
  entity: string;
  detail: string;
  created_at: Date;
};

/**
 * Records who did what. Never throws: a failed log entry must not undo the
 * change the admin just made.
 */
export async function logActivity(
  admin: { id: number; email: string } | null,
  action: string,
  entity: string,
  detail = "",
) {
  try {
    await query(
      "INSERT INTO activity_logs (admin_id, admin_email, action, entity, detail) VALUES ($1, $2, $3, $4, $5)",
      [admin?.id ?? null, admin?.email ?? "", action, entity, detail.slice(0, 300)],
    );
  } catch (error) {
    console.error("Activity log: the entry could not be written.", error);
  }
}

export const ACTIVITY_PAGE_SIZE = 40;

export async function listActivity(page = 1, limit = ACTIVITY_PAGE_SIZE) {
  const [rows, [{ count }]] = await Promise.all([
    query<Activity>(
      `SELECT id, admin_email, action, entity, detail, created_at FROM activity_logs
       ORDER BY created_at DESC, id DESC LIMIT $1 OFFSET $2`,
      [limit, (page - 1) * limit],
    ),
    query<{ count: string }>("SELECT count(*) FROM activity_logs"),
  ]);
  return { rows, total: Number(count) };
}
