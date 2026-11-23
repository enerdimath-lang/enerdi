"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ui } from "./ui";
import { uploadImage } from "./upload";

/** Uploads one or more images, then refreshes the list below it. */
export function MediaUploader() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setMessage(null);

    const failures: string[] = [];
    let done = 0;
    for (const file of Array.from(files)) {
      const result = await uploadImage(file);
      if ("error" in result) failures.push(`${file.name}: ${result.error}`);
      else done += 1;
    }

    setBusy(false);
    if (input.current) input.current.value = "";
    setMessage(
      failures.length > 0
        ? { ok: false, text: failures.join(" ") }
        : { ok: true, text: `${done} ${done === 1 ? "image" : "images"} uploaded.` },
    );
    router.refresh();
  }

  return (
    <div className={`${ui.card} border-t-[6px] border-t-sky-brand p-6`}>
      <input
        ref={input}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/gif,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => onFiles(event.target.files)}
      />
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          className={ui.primary}
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          {busy ? "Uploading…" : "Upload images"}
        </button>
        <p className="text-sm text-muted">PNG, JPG, GIF or WebP, up to 4 MB each.</p>
      </div>
      {message && (
        <p
          role={message.ok ? "status" : "alert"}
          className={`mt-4 text-[0.95rem] font-medium ${message.ok ? "text-emerald-800" : "text-red-700"}`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
