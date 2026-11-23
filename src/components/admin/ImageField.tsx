"use client";

import { useId, useRef, useState } from "react";
import { ui } from "./ui";
import { uploadImage } from "./upload";

export type LibraryImage = { url: string; filename: string; alt?: string };

/**
 * Picks one image: upload a new one, choose one uploaded earlier, or paste an
 * address. The value is the image's web address.
 */
export function ImageField({
  label,
  value,
  onChange,
  library,
  hint,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  library: LibraryImage[];
  hint?: string;
}) {
  const id = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [choosing, setChoosing] = useState(false);
  const [uploaded, setUploaded] = useState<LibraryImage[]>([]);

  const all = [...uploaded, ...library.filter((item) => !uploaded.some((u) => u.url === item.url))];

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    const result = await uploadImage(file);
    setBusy(false);
    if (fileInput.current) fileInput.current.value = "";
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setUploaded((list) => [{ url: result.url, filename: file.name }, ...list]);
    onChange(result.url);
  }

  return (
    <div>
      <label htmlFor={id} className={ui.label}>
        {label}
      </label>
      {hint && <p className={ui.hint}>{hint}</p>}
      <div className="mt-2 flex flex-wrap items-start gap-4">
        <div className="flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden border border-line bg-paper">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="font-mono text-xs text-muted">No image</span>
          )}
        </div>
        <div className="min-w-56 flex-1">
          <input
            id={id}
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="/media/… or https://…"
            className={`${ui.input} mt-0 font-mono text-sm`}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              ref={fileInput}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(event) => onFile(event.target.files?.[0])}
            />
            <button
              type="button"
              className={ui.small}
              disabled={busy}
              onClick={() => fileInput.current?.click()}
            >
              {busy ? "Uploading…" : "Upload an image"}
            </button>
            {all.length > 0 && (
              <button
                type="button"
                className={ui.small}
                aria-expanded={choosing}
                onClick={() => setChoosing((open) => !open)}
              >
                {choosing ? "Close" : "Choose an uploaded image"}
              </button>
            )}
            {value && (
              <button type="button" className={ui.small} onClick={() => onChange("")}>
                Remove
              </button>
            )}
          </div>
          {error && (
            <p role="alert" className="mt-2 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
        </div>
      </div>

      {choosing && (
        <ul className="mt-3 grid max-h-64 grid-cols-3 gap-2 overflow-y-auto border border-line bg-paper p-2 sm:grid-cols-5">
          {all.map((item) => (
            <li key={item.url}>
              <button
                type="button"
                title={item.filename}
                aria-label={`Use ${item.filename}`}
                className={`block w-full border-2 ${
                  item.url === value ? "border-sky-brand" : "border-transparent hover:border-navy-800"
                }`}
                onClick={() => {
                  onChange(item.url);
                  setChoosing(false);
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
