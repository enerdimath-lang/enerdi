import "server-only";
import { randomBytes } from "node:crypto";
import { query } from "./db";

/**
 * Uploaded images are stored in the database itself, so they travel with it:
 * nothing depends on the server's disk, which matters on hosts that wipe it
 * (and when the database moves to Supabase).
 */

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export type MediaItem = {
  id: string;
  filename: string;
  alt: string;
  mime: string;
  bytes: number;
  width: number | null;
  height: number | null;
  created_at: Date;
  updated_at: Date;
};

const COLUMNS = "id, filename, alt, mime, bytes, width, height, created_at, updated_at";

type Kind = { mime: string; ext: string; width: number | null; height: number | null };

/** JPEG keeps its size in a "start of frame" block somewhere after the header. */
function jpegSize(data: Buffer) {
  let offset = 2;
  while (offset + 9 < data.length) {
    if (data[offset] !== 0xff) return null;
    const marker = data[offset + 1];
    const isFrame =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isFrame) {
      return { height: data.readUInt16BE(offset + 5), width: data.readUInt16BE(offset + 7) };
    }
    offset += 2 + data.readUInt16BE(offset + 2);
  }
  return null;
}

function webpSize(data: Buffer) {
  if (data.length < 30) return null;
  const format = data.subarray(12, 16).toString("latin1");
  if (format === "VP8X") {
    return { width: data.readUIntLE(24, 3) + 1, height: data.readUIntLE(27, 3) + 1 };
  }
  if (format === "VP8 ") {
    return { width: data.readUInt16LE(26) & 0x3fff, height: data.readUInt16LE(28) & 0x3fff };
  }
  if (format === "VP8L") {
    const bits = data.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  return null;
}

/**
 * Works out the image type and size from the file's own bytes, never from
 * its name or from what the browser claims it is.
 */
export function sniffImage(data: Buffer): Kind | null {
  if (data.length < 24) return null;
  if (data.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex"))) {
    return { mime: "image/png", ext: "png", width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
  }
  if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg", width: null, height: null, ...jpegSize(data) };
  }
  const head = data.subarray(0, 6).toString("latin1");
  if (head === "GIF87a" || head === "GIF89a") {
    return { mime: "image/gif", ext: "gif", width: data.readUInt16LE(6), height: data.readUInt16LE(8) };
  }
  if (
    data.subarray(0, 4).toString("latin1") === "RIFF" &&
    data.subarray(8, 12).toString("latin1") === "WEBP"
  ) {
    return { mime: "image/webp", ext: "webp", width: null, height: null, ...webpSize(data) };
  }
  return null;
}

export function mediaUrl(item: { id: string }) {
  return `/media/${item.id}`;
}

function cleanName(filename: string, ext: string) {
  return filename.replace(/[^\w.\- ()]+/g, "").trim().slice(0, 120) || `image.${ext}`;
}

/** Stores a new image. Returns null when the file is not a real image. */
export async function storeImage(filename: string, data: Buffer) {
  const kind = sniffImage(data);
  if (!kind) return null;

  const id = `${randomBytes(9).toString("base64url")}.${kind.ext}`;
  const name = cleanName(filename, kind.ext);
  await query(
    `INSERT INTO media (id, filename, mime, bytes, data, width, height)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, name, kind.mime, data.length, data, kind.width, kind.height],
  );
  return { id, filename: name, mime: kind.mime, bytes: data.length };
}

/**
 * Swaps the picture behind an existing address, so every page that uses it
 * shows the new one without being edited.
 */
export async function replaceImage(id: string, data: Buffer) {
  const kind = sniffImage(data);
  if (!kind) return null;
  const rows = await query(
    `UPDATE media SET mime = $2, bytes = $3, data = $4, width = $5, height = $6, updated_at = now()
     WHERE id = $1 RETURNING id`,
    [id, kind.mime, data.length, data, kind.width, kind.height],
  );
  return rows.length > 0 ? { id } : null;
}

export async function updateMediaDetails(id: string, filename: string, alt: string) {
  await query("UPDATE media SET filename = $2, alt = $3 WHERE id = $1", [
    id,
    cleanName(filename, "png"),
    alt.slice(0, 300),
  ]);
}

export async function listMedia(search = "") {
  if (!search) {
    return query<MediaItem>(
      `SELECT ${COLUMNS} FROM media ORDER BY created_at DESC LIMIT 500`,
    );
  }
  return query<MediaItem>(
    `SELECT ${COLUMNS} FROM media WHERE filename ILIKE $1 OR alt ILIKE $1
     ORDER BY created_at DESC LIMIT 500`,
    [`%${search.replace(/[%_\\]/g, "\\$&")}%`],
  );
}

export async function countMedia() {
  const [row] = await query<{ count: string }>("SELECT count(*) FROM media");
  return Number(row.count);
}

export async function readMedia(id: string) {
  const [row] = await query<{ mime: string; data: Buffer; updated_at: Date }>(
    "SELECT mime, data, updated_at FROM media WHERE id = $1",
    [id],
  );
  return row ?? null;
}

/** Just enough to tell whether a browser's saved copy is still current, without loading the image. */
export async function readMediaVersion(id: string) {
  const [row] = await query<{ bytes: number; updated_at: Date }>(
    "SELECT bytes, updated_at FROM media WHERE id = $1",
    [id],
  );
  return row ?? null;
}

export async function deleteMedia(id: string) {
  await query("DELETE FROM media WHERE id = $1", [id]);
}

/**
 * Which uploaded images appear somewhere on the site: in an article, a blog
 * post, a product or service, page text, or SEO settings.
 */
export async function usedMediaIds(ids: string[]) {
  if (ids.length === 0) return new Set<string>();
  const [row] = await query<{ haystack: string }>(
    `SELECT concat_ws(' ',
       (SELECT string_agg(concat_ws(' ', body, cover_url, og_image), ' ') FROM posts),
       (SELECT string_agg(concat_ws(' ', draft::text, published::text), ' ') FROM site_content),
       (SELECT string_agg(image_url, ' ') FROM products),
       (SELECT string_agg(image_url, ' ') FROM services),
       (SELECT string_agg(og_image, ' ') FROM seo_metadata)
     ) AS haystack`,
  );
  const haystack = row?.haystack ?? "";
  return new Set(ids.filter((id) => haystack.includes(`/media/${id}`)));
}
