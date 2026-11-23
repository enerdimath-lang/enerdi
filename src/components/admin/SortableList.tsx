"use client";

import { useState, useTransition } from "react";
import { reorderCatalogAction } from "@/app/admin/actions";

/**
 * Rows the admin can drag into a new order (or move with the arrow buttons,
 * for keyboards and touch screens). The new order is saved straight away.
 */
export function SortableList({
  kind,
  rows,
}: {
  kind: string;
  rows: { id: number; content: React.ReactNode }[];
}) {
  const [order, setOrder] = useState(rows.map((row) => row.id));
  const [dragging, setDragging] = useState<number | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, startSaving] = useTransition();

  // Rows that were added or removed on the server since the last drag.
  const known = new Set(rows.map((row) => row.id));
  const current = [
    ...order.filter((id) => known.has(id)),
    ...rows.map((row) => row.id).filter((id) => !order.includes(id)),
  ];

  function save(next: number[]) {
    setOrder(next);
    startSaving(async () => {
      const result = await reorderCatalogAction(kind, next);
      setMessage(
        "error" in result
          ? { ok: false, text: result.error ?? "The order could not be saved." }
          : { ok: true, text: "Order saved. The website shows the new order." },
      );
    });
  }

  function move(id: number, to: number) {
    const from = current.indexOf(id);
    if (from === -1 || to < 0 || to >= current.length || from === to) return;
    const next = [...current];
    next.splice(to, 0, next.splice(from, 1)[0]);
    save(next);
  }

  return (
    <>
      <p role="status" className={`mb-3 min-h-6 text-sm font-medium ${message?.ok === false ? "text-red-700" : "text-emerald-800"}`}>
        {saving ? "Saving the order…" : message?.text}
      </p>
      <ul className="grid gap-3">
        {current.map((id, index) => {
          const row = rows.find((item) => item.id === id)!;
          return (
            <li
              key={id}
              draggable
              onDragStart={(event) => {
                setDragging(id);
                event.dataTransfer.effectAllowed = "move";
              }}
              onDragEnd={() => setDragging(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (dragging !== null) move(dragging, index);
                setDragging(null);
              }}
              className={`flex items-stretch border border-line bg-white ${dragging === id ? "opacity-40" : ""}`}
            >
              <div className="flex shrink-0 flex-col items-center justify-center gap-1 border-r border-line bg-paper px-2 py-2">
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={index === 0 || saving}
                  onClick={() => move(id, index - 1)}
                  className="px-1.5 text-navy-800 disabled:opacity-30"
                >
                  ↑
                </button>
                <span aria-hidden="true" title="Drag to reorder" className="cursor-grab font-mono text-xs text-muted select-none">
                  ⋮⋮
                </span>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={index === current.length - 1 || saving}
                  onClick={() => move(id, index + 1)}
                  className="px-1.5 text-navy-800 disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
              <div className="min-w-0 flex-1">{row.content}</div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
