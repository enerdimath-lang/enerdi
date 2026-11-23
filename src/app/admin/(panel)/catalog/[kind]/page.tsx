import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteCatalogAction, setCatalogStatusAction } from "@/app/admin/actions";
import { StatusBadge } from "@/components/admin/bits";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { PageTitle } from "@/components/admin/PageTitle";
import { SortableList } from "@/components/admin/SortableList";
import { ui } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { catalogKinds, isCatalogKind, listCatalog } from "@/lib/catalog";

// Waits for the session check on the server instead of showing a prefetched page.
export const instant = false;

export default async function CatalogPage({ params }: PageProps<"/admin/catalog/[kind]">) {
  await requireAdmin();
  const { kind: segment } = await params;
  if (!isCatalogKind(segment)) notFound();
  const kind = catalogKinds[segment];
  const items = await listCatalog(segment);

  return (
    <>
      <PageTitle
        eyebrow="Management"
        title={kind.plural}
        intro={`Drag a row, or use its arrows, to change the order on the website. Only published ${kind.plural.toLowerCase()} are shown to visitors.`}
      >
        <Link href={`/admin/catalog/${segment}/new`} className={ui.primary}>
          Add a {kind.singular}
        </Link>
      </PageTitle>

      {items.length === 0 ? (
        <div className={`${ui.card} p-10 text-center`}>
          <p className="text-lg text-muted">Nothing here yet.</p>
          <p className="mt-5">
            <Link href={`/admin/catalog/${segment}/new`} className={ui.primary}>
              Add the first {kind.singular}
            </Link>
          </p>
        </div>
      ) : (
        <SortableList
          kind={segment}
          rows={items.map((item) => {
            const live = item.status === "published";
            return {
              id: item.id,
              content: (
                <div className="flex flex-wrap items-center gap-4 p-4">
                  <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden bg-paper">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-mono text-[0.65rem] text-muted">No image</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-3">
                      <StatusBadge status={item.status} />
                      {item.category && (
                        <span className="font-mono text-xs tracking-[0.12em] text-navy-700 uppercase">
                          {item.category}
                        </span>
                      )}
                    </p>
                    <h2 className="mt-1.5 truncate text-lg font-extrabold text-navy-800">
                      <Link href={`/admin/catalog/${segment}/${item.id}`} className="hover:underline">
                        {item.name}
                      </Link>
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/admin/catalog/${segment}/${item.id}`} className={ui.small}>
                      Edit
                    </Link>
                    <form action={setCatalogStatusAction}>
                      <input type="hidden" name="kind" value={segment} />
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="status" value={live ? "unpublished" : "published"} />
                      <button type="submit" className={ui.small}>
                        {live ? "Unpublish" : "Publish"}
                      </button>
                    </form>
                    <form action={deleteCatalogAction}>
                      <input type="hidden" name="kind" value={segment} />
                      <input type="hidden" name="id" value={item.id} />
                      <ConfirmButton question={`Delete "${item.name}" for good?`} />
                    </form>
                  </div>
                </div>
              ),
            };
          })}
        />
      )}
    </>
  );
}
