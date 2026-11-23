"use client";

import { useActionState, useEffect, useState } from "react";
import { saveMenuAction } from "@/app/admin/actions";
import { Notice } from "./Notice";
import { ui } from "./ui";

export type EditableItem = {
  label: string;
  href: string;
  enabled: boolean;
  newTab: boolean;
  children: EditableItem[];
};

type Keyed = EditableItem & { key: number };
type Row = Omit<Keyed, "children"> & { children: Keyed[] };

/** Rows need a stable identity while they are dragged around; any unique number will do. */
let lastKey = 0;
const newKey = () => ++lastKey;

/** [3] is the fourth top-level item; [3, 1] is its second dropdown entry. */
type Path = [number] | [number, number];

const pages = [
  "/",
  "/about",
  "/products",
  "/services",
  "/knowledge-hub",
  "/blog",
  "/idea-factory",
  "/contact",
];

function ItemRow({
  item,
  path,
  count,
  nested,
  dragging,
  onChange,
  onMove,
  onRemove,
  onAddChild,
  onDragStart,
  onDrop,
}: {
  item: EditableItem;
  path: Path;
  count: number;
  nested: boolean;
  dragging: boolean;
  onChange: (patch: Partial<EditableItem>) => void;
  onMove: (to: number) => void;
  onRemove: () => void;
  onAddChild?: () => void;
  onDragStart: () => void;
  onDrop: () => void;
}) {
  const index = path[path.length - 1];
  const name = item.label || "this item";
  return (
    <div
      draggable
      onDragStart={(event) => {
        event.stopPropagation();
        event.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onDrop();
      }}
      className={`flex flex-wrap items-end gap-3 border border-line p-3 ${nested ? "bg-paper" : "bg-white"} ${
        dragging ? "opacity-40" : ""
      } ${item.enabled ? "" : "border-dashed"}`}
    >
      <div className="flex shrink-0 items-center gap-1 self-center">
        <span aria-hidden="true" title="Drag to reorder" className="cursor-grab px-1 font-mono text-sm text-muted select-none">
          ⋮⋮
        </span>
        <button type="button" className={ui.small} disabled={index === 0} aria-label={`Move ${name} up`} onClick={() => onMove(index - 1)}>
          ↑
        </button>
        <button type="button" className={ui.small} disabled={index === count - 1} aria-label={`Move ${name} down`} onClick={() => onMove(index + 1)}>
          ↓
        </button>
      </div>
      <label className="min-w-36 flex-1 text-sm font-semibold text-navy-800">
        Label
        <input
          value={item.label}
          onChange={(event) => onChange({ label: event.target.value })}
          maxLength={60}
          className={`${ui.input} mt-1`}
        />
      </label>
      <label className="min-w-44 flex-[1.3] text-sm font-semibold text-navy-800">
        Link
        <input
          value={item.href}
          onChange={(event) => onChange({ href: event.target.value })}
          list="menu-pages"
          maxLength={300}
          placeholder="/about or https://…"
          className={`${ui.input} mt-1 font-mono text-sm`}
        />
      </label>
      <div className="grid gap-1.5 self-center text-sm text-ink">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={item.enabled} onChange={(event) => onChange({ enabled: event.target.checked })} className="h-4 w-4" />
          Shown
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={item.newTab} onChange={(event) => onChange({ newTab: event.target.checked })} className="h-4 w-4" />
          New tab
        </label>
      </div>
      <div className="flex shrink-0 gap-2 self-center">
        {onAddChild && (
          <button type="button" className={ui.small} onClick={onAddChild}>
            + Dropdown item
          </button>
        )}
        <button type="button" className={ui.danger} aria-label={`Remove ${name}`} onClick={onRemove}>
          Remove
        </button>
      </div>
    </div>
  );
}

/**
 * Edits one menu. Rows can be dragged or moved with the arrows; a top-level
 * row can hold a dropdown of further links. Nothing changes on the website
 * until "Save menu" is pressed, and then all of it changes at once.
 */
export function MenuEditor({ menu, initial }: { menu: "header" | "footer"; initial: EditableItem[] }) {
  const [state, action, pending] = useActionState(saveMenuAction, null);
  const withKeys = (items: EditableItem[]): Row[] =>
    items.map((item) => ({
      ...item,
      key: newKey(),
      children: item.children.map((child) => ({ ...child, key: newKey(), children: [] })),
    }));
  const [items, setItems] = useState<Row[]>(() => withKeys(initial));
  const [dirty, setDirty] = useState(false);
  const [drag, setDrag] = useState<Path | null>(null);

  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    if (state?.ok) setDirty(false);
  }

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function update(change: (draft: Row[]) => Row[]) {
    setDirty(true);
    setItems((current) => change(current.map((item) => ({ ...item, children: [...item.children] }))));
  }

  const blankItem = () => ({ label: "", href: "/", enabled: true, newTab: false, children: [], key: newKey() });

  function patch(path: Path, change: Partial<EditableItem>) {
    update((draft) => {
      if (path.length === 1) draft[path[0]] = { ...draft[path[0]], ...change } as Row;
      else draft[path[0]].children[path[1]] = { ...draft[path[0]].children[path[1]], ...change };
      return draft;
    });
  }

  function move(path: Path, to: number) {
    update((draft) => {
      const list = path.length === 1 ? draft : draft[path[0]].children;
      const from = path[path.length - 1];
      if (to < 0 || to >= list.length) return draft;
      list.splice(to, 0, list.splice(from, 1)[0] as never);
      return draft;
    });
  }

  function remove(path: Path) {
    update((draft) => {
      if (path.length === 1) draft.splice(path[0], 1);
      else draft[path[0]].children.splice(path[1], 1);
      return draft;
    });
  }

  /** Dropping only reorders within the list the row came from. */
  function drop(target: Path) {
    if (!drag || drag.length !== target.length) return setDrag(null);
    if (drag.length === 2 && drag[0] !== target[0]) return setDrag(null);
    move(drag, target[target.length - 1]);
    setDrag(null);
  }

  const same = (a: Path | null, b: Path) => a !== null && a.join() === b.join();
  const clean = items.map(({ label, href, enabled, newTab, children }) => ({
    label,
    href,
    enabled,
    newTab,
    children: children.map((child) => ({
      label: child.label,
      href: child.href,
      enabled: child.enabled,
      newTab: child.newTab,
    })),
  }));

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="menu" value={menu} />
      <input type="hidden" name="json" value={JSON.stringify(clean)} />
      <datalist id="menu-pages">
        {pages.map((page) => (
          <option key={page} value={page} />
        ))}
      </datalist>

      {items.length === 0 && (
        <p className={`${ui.card} p-6 text-muted`}>This menu is empty. Add an item to begin.</p>
      )}

      <ul className="grid gap-3">
        {items.map((item, index) => (
          <li key={item.key}>
            <ItemRow
              item={item}
              path={[index]}
              count={items.length}
              nested={false}
              dragging={same(drag, [index])}
              onChange={(change) => patch([index], change)}
              onMove={(to) => move([index], to)}
              onRemove={() => remove([index])}
              onAddChild={() =>
                update((draft) => {
                  draft[index].children.push(blankItem());
                  return draft;
                })
              }
              onDragStart={() => setDrag([index])}
              onDrop={() => drop([index])}
            />
            {item.children.length > 0 && (
              <ul className="mt-2 ml-6 grid gap-2 border-l-[3px] border-sky-brand pl-4 sm:ml-10">
                {item.children.map((child, childIndex) => (
                  <li key={child.key}>
                    <ItemRow
                      item={child}
                      path={[index, childIndex]}
                      count={item.children.length}
                      nested
                      dragging={same(drag, [index, childIndex])}
                      onChange={(change) => patch([index, childIndex], change)}
                      onMove={(to) => move([index, childIndex], to)}
                      onRemove={() => remove([index, childIndex])}
                      onDragStart={() => setDrag([index, childIndex])}
                      onDrop={() => drop([index, childIndex])}
                    />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      <div>
        <button type="button" className={ui.secondary} onClick={() => update((draft) => [...draft, blankItem()])}>
          + Add a menu item
        </button>
      </div>

      <div className={`${ui.card} grid gap-3 border-t-[5px] border-t-sky-brand p-4`}>
        <Notice state={state} />
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={pending} className={ui.publish}>
            {pending ? "Saving…" : "Save menu"}
          </button>
          <p className="text-sm text-muted">
            {dirty ? "You have unsaved changes." : "The website shows this menu."}
          </p>
        </div>
      </div>
    </form>
  );
}
