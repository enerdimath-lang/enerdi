import Link from "next/link";
import { formatDateTime, param } from "@/components/admin/bits";
import { MediaCard } from "@/components/admin/MediaCard";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { PageTitle } from "@/components/admin/PageTitle";
import { ui } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { listMedia, mediaUrl, usedMediaIds } from "@/lib/media";

// Waits for the session check on the server instead of showing a prefetched page.
export const instant = false;

function size(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default async function MediaPage({ searchParams }: PageProps<"/admin/media">) {
  await requireAdmin();
  const query = await searchParams;
  const search = param(query.q);
  const show = param(query.show);

  const all = await listMedia(search);
  const used = await usedMediaIds(all.map((item) => item.id));
  const items = show === "unused" ? all.filter((item) => !used.has(item.id)) : all;

  return (
    <>
      <PageTitle
        eyebrow="Library"
        title="Media Library"
        intro="Every image used on the website. Upload once, then pick it wherever an image is needed."
      />
      <MediaUploader />

      <form className={`${ui.card} mt-6 flex flex-wrap items-end gap-3 p-4`}>
        <label className="min-w-48 flex-1 text-sm font-semibold text-navy-800">
          Search
          <input type="search" name="q" defaultValue={search} placeholder="Name or alt text" className={`${ui.input} mt-1`} />
        </label>
        <label className="text-sm font-semibold text-navy-800">
          Show
          <select name="show" defaultValue={show} className={`${ui.input} mt-1`}>
            <option value="">All images</option>
            <option value="unused">Not used anywhere</option>
          </select>
        </label>
        <button type="submit" className={ui.secondary}>
          Apply
        </button>
        {(search || show) && (
          <Link href="/admin/media" className={ui.small}>
            Clear
          </Link>
        )}
      </form>

      <p className="mt-4 text-sm text-muted">
        {items.length} {items.length === 1 ? "image" : "images"}
        {show === "unused" && " not used anywhere. These are safe to delete."}
      </p>

      {items.length > 0 && (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <MediaCard
              key={item.id}
              item={{
                id: item.id,
                url: mediaUrl(item),
                filename: item.filename,
                alt: item.alt,
                size: size(item.bytes),
                dimensions: item.width && item.height ? `${item.width} × ${item.height}` : "",
                uploaded: formatDateTime(item.created_at),
                inUse: used.has(item.id),
                version: String(new Date(item.updated_at).getTime()),
              }}
            />
          ))}
        </ul>
      )}
    </>
  );
}
