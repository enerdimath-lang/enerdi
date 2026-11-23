"use client";

import { useState } from "react";
import { ImageField, type LibraryImage } from "./ImageField";
import { ui } from "./ui";

export type SeoValues = {
  title: string;
  description: string;
  canonical_url: string;
  noindex: boolean;
  og_title: string;
  og_description: string;
  og_image: string;
  og_image_alt: string;
};

/** Field names differ slightly between pages and posts (posts prefix two of them). */
export type SeoFieldNames = Record<keyof SeoValues, string>;

export const pageSeoNames: SeoFieldNames = {
  title: "title",
  description: "description",
  canonical_url: "canonical_url",
  noindex: "noindex",
  og_title: "og_title",
  og_description: "og_description",
  og_image: "og_image",
  og_image_alt: "og_image_alt",
};

export const postSeoNames: SeoFieldNames = {
  ...pageSeoNames,
  title: "seo_title",
  description: "seo_description",
};

function Counter({ value, best }: { value: string; best: number }) {
  return (
    <span className={`font-mono text-xs font-normal ${value.length > best ? "text-amber-700" : "text-muted"}`}>
      {" "}
      {value.length} / {best}
    </span>
  );
}

/**
 * The search-engine and social-sharing fields, shared by pages, articles and
 * blog posts. Hiding a page from search engines takes a second, deliberate
 * tick, so it cannot happen by accident.
 */
export function SeoFields({
  initial,
  names,
  fallbackTitle,
  fallbackDescription,
  library,
  onChange,
}: {
  initial: SeoValues;
  names: SeoFieldNames;
  fallbackTitle: string;
  fallbackDescription: string;
  library: LibraryImage[];
  onChange?: () => void;
}) {
  const [values, setValues] = useState(initial);
  const [confirmed, setConfirmed] = useState(false);

  function set<K extends keyof SeoValues>(key: K, value: SeoValues[K]) {
    onChange?.();
    setValues((current) => ({ ...current, [key]: value }));
    if (key === "noindex") setConfirmed(false);
  }

  return (
    <div className="grid gap-5">
      <div className="border border-line bg-paper p-4">
        <p className="font-mono text-[0.7rem] tracking-[0.14em] text-muted uppercase">
          How it can look in Google
        </p>
        <p className="mt-2 truncate text-lg text-[#1a0dab]">{values.title || fallbackTitle || "Page title"}</p>
        <p className="line-clamp-2 text-sm text-[#4d5156]">
          {values.description || fallbackDescription || "The description shows here."}
        </p>
      </div>

      <label className={ui.label}>
        SEO title
        <Counter value={values.title} best={60} />
        <input
          name={names.title}
          value={values.title}
          onChange={(event) => set("title", event.target.value)}
          maxLength={160}
          placeholder={fallbackTitle}
          className={ui.input}
        />
        <span className={`${ui.hint} block font-normal`}>Leave empty to use the page title.</span>
      </label>

      <label className={ui.label}>
        Meta description
        <Counter value={values.description} best={160} />
        <textarea
          name={names.description}
          value={values.description}
          onChange={(event) => set("description", event.target.value)}
          rows={3}
          maxLength={320}
          placeholder={fallbackDescription}
          className={ui.input}
        />
      </label>

      <label className={ui.label}>
        Canonical URL <span className="font-normal text-muted">(optional)</span>
        <input
          name={names.canonical_url}
          value={values.canonical_url}
          onChange={(event) => set("canonical_url", event.target.value)}
          maxLength={500}
          placeholder="Leave empty to use this page's own address"
          className={`${ui.input} font-mono text-sm`}
        />
      </label>

      <fieldset className="grid gap-5 border border-line p-4">
        <legend className={`${ui.label} px-2`}>When shared on social media</legend>
        <label className={ui.label}>
          Open Graph title
          <input
            name={names.og_title}
            value={values.og_title}
            onChange={(event) => set("og_title", event.target.value)}
            maxLength={160}
            placeholder="Leave empty to use the SEO title"
            className={ui.input}
          />
        </label>
        <label className={ui.label}>
          Open Graph description
          <textarea
            name={names.og_description}
            value={values.og_description}
            onChange={(event) => set("og_description", event.target.value)}
            rows={2}
            maxLength={320}
            placeholder="Leave empty to use the meta description"
            className={ui.input}
          />
        </label>
        <input type="hidden" name={names.og_image} value={values.og_image} />
        <ImageField
          label="Social sharing image"
          hint="Best at 1200 x 630 pixels."
          value={values.og_image}
          onChange={(url) => set("og_image", url)}
          library={library}
        />
        <label className={ui.label}>
          Image alt text
          <input
            name={names.og_image_alt}
            value={values.og_image_alt}
            onChange={(event) => set("og_image_alt", event.target.value)}
            maxLength={200}
            placeholder="Describe the image in a few words"
            className={ui.input}
          />
        </label>
      </fieldset>

      <fieldset className={`grid gap-3 border p-4 ${values.noindex ? "border-red-300 bg-red-50" : "border-line"}`}>
        <legend className={`${ui.label} px-2`}>Search engines</legend>
        <label className="flex items-start gap-3 text-[0.95rem] text-ink">
          <input
            type="checkbox"
            name={names.noindex}
            checked={values.noindex}
            onChange={(event) => set("noindex", event.target.checked)}
            className="mt-0.5 h-5 w-5 accent-[#b91c1c]"
          />
          <span>
            <span className="font-semibold">Hide from search engines (noindex)</span>
            <span className="block text-muted">
              Leave this off. Turn it on only for a page that must not appear in Google.
            </span>
          </span>
        </label>
        {values.noindex && (
          <label className="flex items-start gap-3 text-[0.95rem] font-semibold text-red-800">
            <input
              type="checkbox"
              name="confirm_noindex"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="mt-0.5 h-5 w-5 accent-[#b91c1c]"
            />
            Yes, hide it from Google. I understand people will not find it by searching.
          </label>
        )}
      </fieldset>
    </div>
  );
}
