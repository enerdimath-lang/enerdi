import { notFound } from "next/navigation";
import { deleteCatalogAction } from "@/app/admin/actions";
import { param } from "@/components/admin/bits";
import { CatalogForm } from "@/components/admin/CatalogForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { PageTitle } from "@/components/admin/PageTitle";
import { requireAdmin } from "@/lib/auth";
import { catalogKinds, getCatalogItem, isCatalogKind, listCatalog } from "@/lib/catalog";
import { getImageLibrary } from "@/lib/library";

// Waits for the session check on the server instead of showing a prefetched page.
export const instant = false;

export default async function CatalogItemPage({
  params,
  searchParams,
}: PageProps<"/admin/catalog/[kind]/[id]">) {
  await requireAdmin();
  const route = (await params) as { kind: string; id?: string };
  if (!isCatalogKind(route.kind)) notFound();
  if (route.id !== undefined && !/^\d{1,9}$/.test(route.id)) notFound();
  const kind = catalogKinds[route.kind];

  const [item, all, library, query] = await Promise.all([
    route.id === undefined ? null : getCatalogItem(route.kind, Number(route.id)),
    listCatalog(route.kind),
    getImageLibrary(),
    searchParams,
  ]);
  if (route.id !== undefined && !item) notFound();
  const categories = [...new Set(all.map((row) => row.category).filter(Boolean))].sort();

  return (
    <>
      <PageTitle
        eyebrow={kind.plural}
        title={item ? `Edit ${kind.singular}` : `New ${kind.singular}`}
        back={{ href: `/admin/catalog/${route.kind}`, label: kind.plural }}
      >
        {item && (
          <form action={deleteCatalogAction}>
            <input type="hidden" name="kind" value={route.kind} />
            <input type="hidden" name="id" value={item.id} />
            <ConfirmButton label={`Delete this ${kind.singular}`} />
          </form>
        )}
      </PageTitle>
      <CatalogForm
        kind={route.kind}
        singular={kind.singular}
        categories={categories}
        library={library}
        savedNotice={param(query.saved) || undefined}
        item={
          item
            ? {
                id: item.id,
                name: item.name,
                full_name: item.full_name,
                category: item.category,
                description: item.description,
                image_url: item.image_url,
                status: item.status,
              }
            : { id: null, name: "", full_name: "", category: "", description: "", image_url: "", status: "draft" }
        }
      />
    </>
  );
}
