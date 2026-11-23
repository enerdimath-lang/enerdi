import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { products as defaultProducts, services as defaultServices } from "@/content/site";
import { dbConfigured, query } from "./db";

/**
 * Products and services: the same kind of record, kept in two tables.
 * The table name only ever comes from the fixed list below, never from a
 * request, so it is safe to place in the SQL text.
 */

export type CatalogKind = "products" | "services";
export type PublishStatus = "draft" | "published" | "unpublished";

export type CatalogItem = {
  id: number;
  name: string;
  full_name: string;
  category: string;
  description: string;
  image_url: string;
  position: number;
  status: PublishStatus;
  updated_at: Date;
};

export const catalogKinds = {
  products: { kind: "products" as const, singular: "product", plural: "Products", path: "/products" },
  services: { kind: "services" as const, singular: "service", plural: "Services", path: "/services" },
};

export function isCatalogKind(value: string): value is CatalogKind {
  return value === "products" || value === "services";
}

const COLUMNS =
  "id, name, full_name, category, description, image_url, position, status, updated_at";

function fallback(kind: CatalogKind): CatalogItem[] {
  const items = kind === "products" ? defaultProducts : defaultServices;
  return items.map((item, index) => ({
    id: -(index + 1),
    name: item.name,
    full_name: item.fullName,
    category: item.category,
    description: item.text,
    image_url: item.image,
    position: index,
    status: "published",
    updated_at: new Date(0),
  }));
}

/** Public site: published items only, in display order. Cached until something changes. */
export async function getPublishedCatalog(kind: CatalogKind): Promise<CatalogItem[]> {
  "use cache";
  cacheTag("catalog");

  if (!dbConfigured()) {
    cacheLife("minutes");
    return fallback(kind);
  }
  try {
    const rows = await query<CatalogItem>(
      `SELECT ${COLUMNS} FROM ${kind} WHERE status = 'published' ORDER BY position, id`,
    );
    cacheLife("hours");
    return rows;
  } catch (error) {
    console.error(`Catalog: ${kind} could not be loaded, showing the built-in list.`, error);
    cacheLife("minutes");
    return fallback(kind);
  }
}

/* ---------- Admin panel ---------- */

export async function listCatalog(kind: CatalogKind) {
  return query<CatalogItem>(`SELECT ${COLUMNS} FROM ${kind} ORDER BY position, id`);
}

export async function getCatalogItem(kind: CatalogKind, id: number) {
  const [row] = await query<CatalogItem>(
    `SELECT ${COLUMNS} FROM ${kind} WHERE id = $1`,
    [id],
  );
  return row ?? null;
}

export type CatalogInput = Pick<
  CatalogItem,
  "name" | "full_name" | "category" | "description" | "image_url" | "status"
>;

export async function saveCatalogItem(kind: CatalogKind, id: number | null, input: CatalogInput) {
  const values = [
    input.name,
    input.full_name,
    input.category,
    input.description,
    input.image_url,
    input.status,
  ];
  if (id === null) {
    const [row] = await query<{ id: number }>(
      `INSERT INTO ${kind} (name, full_name, category, description, image_url, status, position)
       VALUES ($1, $2, $3, $4, $5, $6, (SELECT COALESCE(max(position), -1) + 1 FROM ${kind}))
       RETURNING id`,
      values,
    );
    return row.id;
  }
  await query(
    `UPDATE ${kind} SET name = $1, full_name = $2, category = $3, description = $4,
       image_url = $5, status = $6, updated_at = now() WHERE id = $7`,
    [...values, id],
  );
  return id;
}

export async function setCatalogStatus(kind: CatalogKind, id: number, status: PublishStatus) {
  await query(`UPDATE ${kind} SET status = $2, updated_at = now() WHERE id = $1`, [id, status]);
}

export async function deleteCatalogItem(kind: CatalogKind, id: number) {
  await query(`DELETE FROM ${kind} WHERE id = $1`, [id]);
}

/** Stores a new display order: the ids, first to last. */
export async function reorderCatalog(kind: CatalogKind, ids: number[]) {
  await query(
    `UPDATE ${kind} AS item SET position = ordered.position
     FROM unnest($1::int[]) WITH ORDINALITY AS ordered (id, position)
     WHERE item.id = ordered.id`,
    [ids],
  );
}

export async function countCatalog(kind: CatalogKind) {
  const [row] = await query<{ total: string; published: string }>(
    `SELECT count(*) AS total, count(*) FILTER (WHERE status = 'published') AS published FROM ${kind}`,
  );
  return { total: Number(row.total), published: Number(row.published) };
}
