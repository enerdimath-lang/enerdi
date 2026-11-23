"use client";

import { useRouter } from "next/navigation";
import { useActionState, useRef, useState } from "react";
import { deleteMediaAction, updateMediaAction } from "@/app/admin/actions";
import { CopyButton } from "./CopyButton";
import { Notice } from "./Notice";
import { ui } from "./ui";

export type MediaCardItem = {
  id: string;
  url: string;
  filename: string;
  alt: string;
  size: string;
  dimensions: string;
  uploaded: string;
  inUse: boolean;
  /** Changes when the picture is replaced, so the browser fetches the new one. */
  version: string;
};

/** One image in the media library: details, replace and delete. */
export function MediaCard({ item }: { item: MediaCardItem }) {
  const router = useRouter();
  const [saveState, save, saving] = useActionState(updateMediaAction, null);
  const [deleteState, remove, deleting] = useActionState(deleteMediaAction, null);
  const [open, setOpen] = useState(false);
  const [askDelete, setAskDelete] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [replaceMessage, setReplaceMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function replace(file: File | undefined) {
    if (!file) return;
    setReplacing(true);
    setReplaceMessage(null);
    let message = { ok: false, text: "The image could not be replaced. Please try again." };
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch(`/admin/api/media?id=${encodeURIComponent(item.id)}`, {
        method: "PUT",
        body,
      });
      const data = await response.json().catch(() => null);
      if (response.ok) message = { ok: true, text: "Replaced. Every page that uses it shows the new picture." };
      else if (typeof data?.error === "string") message = { ok: false, text: data.error };
    } catch {
      // Keeps the default message.
    }
    setReplacing(false);
    setReplaceMessage(message);
    if (fileInput.current) fileInput.current.value = "";
    if (message.ok) router.refresh();
  }

  return (
    <li className={ui.card}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${item.url}?v=${item.version}`}
        alt={item.alt}
        loading="lazy"
        className="aspect-[4/3] w-full bg-paper object-contain"
      />
      <div className="grid gap-3 border-t border-line p-4">
        <div>
          <p className="truncate font-semibold text-navy-800" title={item.filename}>
            {item.filename}
          </p>
          <p className="mt-1 font-mono text-xs text-muted">
            {[item.dimensions, item.size, item.uploaded].filter(Boolean).join(" · ")}
          </p>
          <p className="mt-2">
            <span
              className={`px-2 py-1 font-mono text-[0.7rem] tracking-[0.12em] uppercase ${
                item.inUse ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"
              }`}
            >
              {item.inUse ? "In use" : "Not used"}
            </span>
            {!item.alt && (
              <span className="ml-2 font-mono text-[0.7rem] tracking-[0.12em] text-amber-700 uppercase">
                No alt text
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className={ui.small} aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? "Close" : "Edit details"}
          </button>
          <CopyButton text={item.url} />
          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(event) => replace(event.target.files?.[0])}
          />
          <button type="button" className={ui.small} disabled={replacing} onClick={() => fileInput.current?.click()}>
            {replacing ? "Replacing…" : "Replace"}
          </button>
          <button type="button" className={ui.danger} onClick={() => setAskDelete(!askDelete)}>
            Delete
          </button>
        </div>

        {replaceMessage && (
          <p role={replaceMessage.ok ? "status" : "alert"} className={`text-sm font-medium ${replaceMessage.ok ? "text-emerald-800" : "text-red-700"}`}>
            {replaceMessage.text}
          </p>
        )}

        {open && (
          <form action={save} className="grid gap-3 border-t border-line pt-3">
            <input type="hidden" name="id" value={item.id} />
            <Notice state={saveState} />
            <label className={ui.label}>
              Name
              <input name="filename" defaultValue={item.filename} required maxLength={120} className={ui.input} />
            </label>
            <label className={ui.label}>
              Alt text <span className="font-normal text-muted">(describes the picture for people who cannot see it)</span>
              <input name="alt" defaultValue={item.alt} maxLength={300} className={ui.input} />
            </label>
            <div>
              <button type="submit" disabled={saving} className={ui.primary}>
                {saving ? "Saving…" : "Save details"}
              </button>
            </div>
          </form>
        )}

        {askDelete && (
          <form action={remove} className="grid gap-3 border-t border-line pt-3">
            <input type="hidden" name="id" value={item.id} />
            <Notice state={deleteState} />
            {item.inUse && (
              <label className="flex items-start gap-2 text-sm font-medium text-red-800">
                <input type="checkbox" name="force" className="mt-0.5 h-4 w-4" />
                Delete even though it is in use. The pages that show it will have a missing picture.
              </label>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={deleting}
                className="inline-flex items-center bg-red-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Yes, delete this image"}
              </button>
              <button type="button" className={ui.small} onClick={() => setAskDelete(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </li>
  );
}
