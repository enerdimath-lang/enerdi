import Link from "next/link";
import { param } from "@/components/admin/bits";
import { MenuEditor } from "@/components/admin/MenuEditor";
import { PageTitle } from "@/components/admin/PageTitle";
import { requireAdmin } from "@/lib/auth";
import { getMenuForEditing, isMenuName } from "@/lib/navigation";

// Waits for the session check on the server instead of showing a prefetched page.
export const instant = false;

const menus = [
  { name: "header", label: "Header menu" },
  { name: "footer", label: "Footer menu" },
] as const;

export default async function NavigationPage({ searchParams }: PageProps<"/admin/navigation">) {
  await requireAdmin();
  const requested = param((await searchParams).menu);
  const menu = isMenuName(requested) ? requested : "header";
  const items = await getMenuForEditing(menu);

  return (
    <>
      <PageTitle
        eyebrow="Navigation"
        title="Navigation Management"
        intro={
          menu === "header"
            ? 'The menu at the top of every page. A link to /contact is shown as the button on the right. Use "+ Dropdown item" to put links under a menu item.'
            : "The links in the footer. This menu is separate from the header menu."
        }
      />
      <div role="tablist" aria-label="Menus" className="mb-6 flex">
        {menus.map((item) => (
          <Link
            key={item.name}
            href={`/admin/navigation?menu=${item.name}`}
            role="tab"
            aria-selected={menu === item.name}
            className={`border px-5 py-2.5 text-[0.95rem] font-semibold ${
              menu === item.name
                ? "border-navy-800 bg-navy-800 text-white"
                : "border-line bg-white text-navy-800 hover:border-navy-800"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      {/* The key gives each menu its own fresh editor. */}
      <MenuEditor key={menu} menu={menu} initial={items} />
    </>
  );
}
