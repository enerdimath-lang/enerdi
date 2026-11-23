"use client";

import { useActionState } from "react";
import { saveSeoAction } from "@/app/admin/actions";
import type { LibraryImage } from "./ImageField";
import { Notice } from "./Notice";
import { pageSeoNames, SeoFields, type SeoValues } from "./SeoFields";
import { ui } from "./ui";

export function SeoForm({
  pageKey,
  initial,
  fallbackTitle,
  fallbackDescription,
  library,
}: {
  pageKey: string;
  initial: SeoValues;
  fallbackTitle: string;
  fallbackDescription: string;
  library: LibraryImage[];
}) {
  const [state, action, pending] = useActionState(saveSeoAction, null);
  return (
    <form action={action} className="grid gap-5">
      <input type="hidden" name="key" value={pageKey} />
      <div className={`${ui.card} p-6`}>
        <SeoFields
          initial={initial}
          names={pageSeoNames}
          fallbackTitle={fallbackTitle}
          fallbackDescription={fallbackDescription}
          library={library}
        />
      </div>
      <div className={`${ui.card} grid gap-3 border-t-[5px] border-t-sky-brand p-4`}>
        <Notice state={state} />
        <div>
          <button type="submit" disabled={pending} className={ui.publish}>
            {pending ? "Saving…" : "Save SEO settings"}
          </button>
        </div>
      </div>
    </form>
  );
}
