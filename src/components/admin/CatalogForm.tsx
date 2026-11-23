"use client";

import { useActionState, useState } from "react";
import { saveCatalogAction } from "@/app/admin/actions";
import { ProductCard } from "@/components/ProductCard";
import { ImageField, type LibraryImage } from "./ImageField";
import { Notice } from "./Notice";
import { ui } from "./ui";

export type CatalogFormValues = {
  id: number | null;
  name: string;
  full_name: string;
  category: string;
  description: string;
  image_url: string;
  status: "draft" | "published" | "unpublished";
};

const statusLine = {
  published: "Live on the website",
  draft: "Draft, not visible",
  unpublished: "Unpublished, not visible",
};

const saved = {
  published: "Published. It is live on the website now.",
  draft: "Saved as a draft. Visitors cannot see it.",
  unpublished: "Unpublished. Visitors can no longer see it.",
};

export function CatalogForm({
  kind,
  singular,
  item,
  categories,
  library,
  savedNotice,
}: {
  kind: "products" | "services";
  singular: string;
  item: CatalogFormValues;
  categories: string[];
  library: LibraryImage[];
  savedNotice?: string;
}) {
  const [state, action, pending] = useActionState(saveCatalogAction, null);
  const [values, setValues] = useState(item);

  // What the server last confirmed.
  const [status, setStatus] = useState(item.status);
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    if (state?.ok) {
      setStatus(state.ok.startsWith("Published") ? "published" : state.ok.startsWith("Unpublished") ? "unpublished" : status);
    }
  }

  const set = <K extends keyof CatalogFormValues>(key: K, value: CatalogFormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));
  const isLive = status === "published";

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={values.id ?? ""} />
      <input type="hidden" name="image_url" value={values.image_url} />

      <div className="grid gap-6">
        <Notice
          state={
            state ??
            (savedNotice && savedNotice in saved
              ? { ok: saved[savedNotice as keyof typeof saved] }
              : null)
          }
        />
        <div className={`${ui.card} grid gap-5 p-6`}>
          <label className={ui.label}>
            Name
            <input
              name="name"
              value={values.name}
              onChange={(event) => set("name", event.target.value)}
              required
              maxLength={120}
              className={`${ui.input} text-xl font-semibold`}
            />
          </label>
          <label className={ui.label}>
            Full name or tagline <span className="font-normal text-muted">(optional)</span>
            <input
              name="full_name"
              value={values.full_name}
              onChange={(event) => set("full_name", event.target.value)}
              maxLength={160}
              className={ui.input}
            />
          </label>
          <label className={ui.label}>
            Category <span className="font-normal text-muted">(optional)</span>
            <input
              name="category"
              list="catalog-categories"
              value={values.category}
              onChange={(event) => set("category", event.target.value)}
              maxLength={80}
              placeholder="Choose one you have used before, or type a new one"
              className={ui.input}
            />
            <datalist id="catalog-categories">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </label>
          <label className={ui.label}>
            Description
            <textarea
              name="description"
              value={values.description}
              onChange={(event) => set("description", event.target.value)}
              rows={7}
              maxLength={4000}
              className={ui.input}
            />
          </label>
          <ImageField
            label="Image"
            hint="Optional. Wide pictures work best."
            value={values.image_url}
            onChange={(url) => set("image_url", url)}
            library={library}
          />
        </div>
      </div>

      <aside className="grid gap-6 lg:sticky lg:top-20">
        <div className={`${ui.card} grid gap-4 p-5`}>
          <p className="flex items-center gap-3 font-mono text-xs tracking-[0.14em] uppercase">
            <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${isLive ? "bg-emerald-500" : "bg-amber-400"}`} />
            {values.id ? statusLine[status] : "New, not saved yet"}
          </p>
          <div className="grid gap-2">
            <button type="submit" name="intent" value="publish" disabled={pending} className={ui.publish}>
              {pending ? "Saving…" : isLive ? "Publish changes" : "Publish"}
            </button>
            {isLive ? (
              <button type="submit" name="intent" value="unpublish" disabled={pending} className={ui.secondary}>
                Unpublish
              </button>
            ) : (
              <button type="submit" name="intent" value="save" disabled={pending} className={ui.secondary}>
                {values.id ? "Save without publishing" : "Save draft"}
              </button>
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 font-mono text-xs tracking-[0.14em] text-muted uppercase">
            Preview of the {singular}
          </p>
          <ProductCard
            index={0}
            name={values.name || "Name"}
            fullName={values.full_name}
            category={values.category}
            text={values.description}
            image={values.image_url}
          />
        </div>
      </aside>
    </form>
  );
}
