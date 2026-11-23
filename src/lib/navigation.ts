import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { footerNavigation, navigation } from "@/content/site";
import { dbConfigured, query, transaction } from "./db";

export type MenuName = "header" | "footer";

export type MenuItem = {
  label: string;
  href: string;
  enabled: boolean;
  newTab: boolean;
  /** Dropdown entries. Only top-level items have them. */
  children: MenuItem[];
};

export function isMenuName(value: string): value is MenuName {
  return value === "header" || value === "footer";
}

/** On-site paths ("/about", "#top") or full web, mail and phone addresses. */
export function isSafeHref(href: string) {
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  if (href.startsWith("#")) return true;
  return /^(https?:\/\/|mailto:|tel:)\S+$/i.test(href);
}

export function isExternal(href: string) {
  return /^https?:\/\//i.test(href);
}

function fallback(menu: MenuName): MenuItem[] {
  return (menu === "header" ? navigation : footerNavigation).map((item) => ({
    ...item,
    enabled: true,
    newTab: false,
    children: [],
  }));
}

type Row = {
  id: number;
  parent_id: number | null;
  label: string;
  href: string;
  enabled: boolean;
  new_tab: boolean;
};

async function loadMenu(menu: MenuName): Promise<MenuItem[]> {
  const rows = await query<Row>(
    `SELECT id, parent_id, label, href, enabled, new_tab FROM navigation_items
     WHERE menu = $1 ORDER BY position, id`,
    [menu],
  );
  const toItem = (row: Row): MenuItem => ({
    label: row.label,
    href: row.href,
    enabled: row.enabled,
    newTab: row.new_tab,
    children: rows.filter((child) => child.parent_id === row.id).map(toItem),
  });
  return rows.filter((row) => row.parent_id === null).map(toItem);
}

const onlyEnabled = (items: MenuItem[]): MenuItem[] =>
  items
    .filter((item) => item.enabled)
    .map((item) => ({ ...item, children: onlyEnabled(item.children) }));

/** Public site: the enabled items of a menu. Cached until the admin saves the menu. */
export async function getMenu(menu: MenuName): Promise<MenuItem[]> {
  "use cache";
  cacheTag("navigation");

  if (!dbConfigured()) {
    cacheLife("minutes");
    return fallback(menu);
  }
  try {
    const items = onlyEnabled(await loadMenu(menu));
    cacheLife("hours");
    return items;
  } catch (error) {
    console.error("Navigation: the menu could not be loaded, showing the built-in one.", error);
    cacheLife("minutes");
    return fallback(menu);
  }
}

/** Admin panel: every item, enabled or not. */
export async function getMenuForEditing(menu: MenuName) {
  return loadMenu(menu);
}

/** Replaces the whole menu with the given tree, as one all-or-nothing change. */
export async function saveMenu(menu: MenuName, items: MenuItem[]) {
  await transaction(async (client) => {
    await client.query("DELETE FROM navigation_items WHERE menu = $1", [menu]);
    for (const [position, item] of items.entries()) {
      const { rows } = await client.query<{ id: number }>(
        `INSERT INTO navigation_items (menu, label, href, position, enabled, new_tab)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [menu, item.label, item.href, position, item.enabled, item.newTab],
      );
      for (const [childPosition, child] of item.children.entries()) {
        await client.query(
          `INSERT INTO navigation_items (menu, parent_id, label, href, position, enabled, new_tab)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [menu, rows[0].id, child.label, child.href, childPosition, child.enabled, child.newTab],
        );
      }
    }
  });
}
