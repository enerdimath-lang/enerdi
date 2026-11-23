"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { saveContentAction } from "@/app/admin/actions";
import { blank, choices, fixedLists, listShapes } from "@/content/sections";
import { ImageField, type LibraryImage } from "./ImageField";
import { Notice } from "./Notice";
import { ui } from "./ui";

/**
 * One form for every section of the site.
 *
 * It is drawn from the shape of the section's built-in text: a piece of text
 * becomes a box, a list becomes rows you can add, remove and reorder, and a
 * group becomes a panel. A new section in `content/sections.ts` therefore gets
 * its form without any extra code here.
 */

const labels: Record<string, string> = {
  eyebrow: "Small heading above the title",
  lead: "Headline",
  intro: "Introduction",
  text: "Text",
  href: "Link (for example /contact)",
  primaryCta: "First button",
  secondaryCta: "Second button",
  meaning: "What the name stands for (one word per row)",
  topicNote: "Note on topics that have no articles yet",
  emptyNote: "Note shown while there are no posts",
  businessUnits: "Business units",
  model: "How we work",
  fullName: "Full name",
  kind: "What kind of idea it is",
  image: "Image",
  enabled: "Enabled (shown on the website)",
  blocks: "Blocks of the home page, top to bottom (drag a row, or use its arrows)",
  show: "Shown",
  productsEyebrow: "Small heading above Products",
  productsTitle: "Products heading",
  servicesEyebrow: "Small heading above Services",
  servicesTitle: "Services heading",
  showNavigation: "Show the footer menu",
  showContactDetails: "Show the contact details",
  showSocialLinks: "Show the social links",
  socialLinks: "Social links (label and full address, for example LinkedIn and https://linkedin.com/company/…)",
  sections: "Extra sections",
  cta: "Button under the ideas (leave the label empty to hide it)",
  categories: "Categories (one per row)",
  topics: "Topics (one per row)",
  email: "Email address",
  phone: "Phone number",
  address: "Address",
  capabilities: "Capability strip under the buttons (a few words per row)",
  focusEyebrow: "Small heading above the focus areas",
  focusTitle: "Focus areas heading",
  focusIntro: "Line under the focus areas heading",
  visual: "Picture shown in the panel",
  tags: "Outcomes on the card (two or three, a few words each)",
  outcomes: "Results under the picture (three; a word such as Less, or a real measured figure)",
  value: "Result (one word, or a real figure such as 20%)",
};

function labelFor(key: string) {
  if (labels[key]) return labels[key];
  const words = key.replace(/([A-Z])/g, " $1").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const longText = new Set(["text", "intro", "summary", "description", "statement", "address", "focusIntro"]);

type Change = (value: unknown) => void;

function TextField({
  name,
  label,
  value,
  onChange,
  long,
}: {
  name: string;
  label: string | null;
  value: string;
  onChange: Change;
  long: boolean;
}) {
  const control = long ? (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={Math.min(8, Math.max(2, Math.ceil(value.length / 80)))}
      aria-label={label ? undefined : name}
      className={`${ui.input} ${label ? "" : "mt-0"}`}
    />
  ) : (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={label ? undefined : name}
      className={`${ui.input} ${label ? "" : "mt-0"}`}
    />
  );
  if (!label) return control;
  return (
    <label className={ui.label}>
      {label}
      {control}
    </label>
  );
}

function RowTools({
  index,
  count,
  onMove,
  onRemove,
  what,
}: {
  index: number;
  count: number;
  onMove: (to: number) => void;
  onRemove: () => void;
  what: string;
}) {
  return (
    <span className="flex shrink-0 gap-1">
      <button
        type="button"
        className={ui.small}
        disabled={index === 0}
        aria-label={`Move ${what} up`}
        onClick={() => onMove(index - 1)}
      >
        ↑
      </button>
      <button
        type="button"
        className={ui.small}
        disabled={index === count - 1}
        aria-label={`Move ${what} down`}
        onClick={() => onMove(index + 1)}
      >
        ↓
      </button>
      <button
        type="button"
        className={ui.danger}
        aria-label={`Remove ${what}`}
        onClick={onRemove}
      >
        Remove
      </button>
    </span>
  );
}

function ListField({
  name,
  path,
  label,
  template,
  value,
  onChange,
  library,
}: {
  name: string;
  path: string;
  label: string | null;
  template: unknown[];
  value: unknown[];
  onChange: Change;
  library: LibraryImage[];
}) {
  const fixed = fixedLists[path];
  const [dragged, setDragged] = useState<number | null>(null);
  const itemTemplate = listShapes[path] ?? template[0] ?? "";
  const simple = typeof itemTemplate === "string";

  const replace = (index: number, item: unknown) =>
    onChange(value.map((current, i) => (i === index ? item : current)));
  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));
  const move = (from: number, to: number) => {
    const next = [...value];
    next.splice(to, 0, next.splice(from, 1)[0]);
    onChange(next);
  };

  if (fixed) {
    return (
      <fieldset className="grid gap-2">
        {label && <legend className={`${ui.label} mb-3`}>{label}</legend>}
        {value.map((item, index) => {
          const record = item as Record<string, unknown>;
          const id = String(record[fixed.id]);
          const title = fixed.labels[id] ?? id;
          return (
            <div
              key={id}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                setDragged(index);
              }}
              onDragEnd={() => setDragged(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (dragged !== null && dragged !== index) move(dragged, index);
                setDragged(null);
              }}
              className={`flex flex-wrap items-center gap-4 border border-line bg-white px-4 py-3 ${
                dragged === index ? "opacity-40" : ""
              } ${record.show === false ? "border-dashed" : ""}`}
            >
              <span aria-hidden="true" title="Drag to reorder" className="cursor-grab font-mono text-sm text-muted select-none">
                ⋮⋮
              </span>
              <span className="font-mono text-xs text-muted">{String(index + 1).padStart(2, "0")}</span>
              <span className="min-w-40 flex-1 font-semibold text-navy-800">{title}</span>
              {Object.entries(template[0] as Record<string, unknown>)
                .filter(([key, part]) => key !== fixed.id && typeof part === "boolean")
                .map(([key]) => (
                  <label key={key} className="flex items-center gap-2 text-[0.95rem] text-ink">
                    <input
                      type="checkbox"
                      checked={record[key] !== false}
                      onChange={(event) => replace(index, { ...record, [key]: event.target.checked })}
                      className="h-5 w-5 accent-[#00205b]"
                    />
                    {labelFor(key)}
                  </label>
                ))}
              <span className="flex gap-1">
                <button type="button" className={ui.small} disabled={index === 0} aria-label={`Move ${title} up`} onClick={() => move(index, index - 1)}>
                  ↑
                </button>
                <button type="button" className={ui.small} disabled={index === value.length - 1} aria-label={`Move ${title} down`} onClick={() => move(index, index + 1)}>
                  ↓
                </button>
              </span>
            </div>
          );
        })}
      </fieldset>
    );
  }

  return (
    <fieldset className="grid gap-3">
      {label && <legend className={`${ui.label} mb-3`}>{label}</legend>}
      {value.length === 0 && <p className={ui.hint}>Nothing here yet.</p>}

      {value.map((item, index) => {
        const what = `${name} ${index + 1}`;
        if (simple) {
          return (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1">
                <TextField
                  name={what}
                  label={null}
                  value={String(item)}
                  onChange={(next) => replace(index, next)}
                  long={String(itemTemplate).length > 70 || String(item).length > 70}
                />
              </div>
              <RowTools
                index={index}
                count={value.length}
                onMove={(to) => move(index, to)}
                onRemove={() => remove(index)}
                what={what}
              />
            </div>
          );
        }

        const record = item as Record<string, unknown>;
        const heading = String(record.title || record.name || `Item ${index + 1}`);
        return (
          <div key={index} className="border border-line bg-paper">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-4 py-3">
              <p className="font-semibold text-navy-800">
                <span className="mr-3 font-mono text-xs text-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {heading}
              </p>
              <RowTools
                index={index}
                count={value.length}
                onMove={(to) => move(index, to)}
                onRemove={() => remove(index)}
                what={heading}
              />
            </div>
            <div className="p-4">
              <Field
                name={what}
                path={path}
                label={null}
                template={itemTemplate}
                value={item}
                onChange={(next) => replace(index, next)}
                library={library}
              />
            </div>
          </div>
        );
      })}

      <div>
        <button
          type="button"
          className={ui.small}
          onClick={() => onChange([...value, blank(itemTemplate, path)])}
        >
          + Add {simple ? "a row" : "an item"}
        </button>
      </div>
    </fieldset>
  );
}

function Field({
  name,
  path,
  label,
  template,
  value,
  onChange,
  library,
}: {
  name: string;
  path: string;
  label: string | null;
  template: unknown;
  value: unknown;
  onChange: Change;
  library: LibraryImage[];
}) {
  if (typeof template === "boolean") {
    return (
      <label className="flex items-center gap-3 text-[0.95rem] font-semibold text-navy-800">
        <input
          type="checkbox"
          checked={value !== false}
          onChange={(event) => onChange(event.target.checked)}
          className="h-5 w-5 accent-[#00205b]"
        />
        {label ?? labelFor(name)}
      </label>
    );
  }

  if (typeof template === "string") {
    if (name === "image") {
      return (
        <ImageField
          label={label ?? "Image"}
          value={String(value ?? "")}
          onChange={onChange}
          library={library}
        />
      );
    }
    const options = choices[path];
    if (options) {
      const current = options.some((option) => option.value === value)
        ? String(value)
        : options[options.length - 1].value;
      return (
        <label className={ui.label}>
          {label ?? labelFor(name)}
          <select
            value={current}
            onChange={(event) => onChange(event.target.value)}
            className={ui.input}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      );
    }
    return (
      <TextField
        name={name}
        label={label}
        value={String(value ?? "")}
        onChange={onChange}
        long={longText.has(name) || template.length > 70}
      />
    );
  }

  if (Array.isArray(template)) {
    return (
      <ListField
        name={name}
        path={path}
        label={label}
        template={template}
        value={Array.isArray(value) ? value : []}
        onChange={onChange}
        library={library}
      />
    );
  }

  const record = (value ?? {}) as Record<string, unknown>;
  const fields = (
    <div className="grid gap-5">
      {Object.entries(template as Record<string, unknown>).map(([key, part]) => (
        <Field
          key={key}
          name={key}
          path={`${path}.${key}`}
          label={labelFor(key)}
          template={part}
          value={record[key]}
          onChange={(next) => onChange({ ...record, [key]: next })}
          library={library}
        />
      ))}
    </div>
  );
  if (!label) return fields;
  return (
    <fieldset className="border border-line bg-paper p-4">
      <legend className={`${ui.label} px-2`}>{label}</legend>
      {fields}
    </fieldset>
  );
}

export function ContentEditor({
  sectionKey,
  returnTo,
  previewHref,
  template,
  initial,
  hasDraft,
  isCustomised,
  library,
}: {
  sectionKey: string;
  /** Where this form lives, so a reset can reload it. */
  returnTo: string;
  /** Address of the draft preview for the page this section is on, if it has one. */
  previewHref?: string;
  template: unknown;
  initial: unknown;
  hasDraft: boolean;
  isCustomised: boolean;
  library: LibraryImage[];
}) {
  const [state, action, pending] = useActionState(saveContentAction, null);
  const [value, setValue] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // What the server last confirmed, so the status line is right after a save.
  const [draft, setDraft] = useState(hasDraft);
  const [customised, setCustomised] = useState(isCustomised);
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    if (state?.ok) {
      setDirty(false);
      const published = state.ok.startsWith("Published");
      setDraft(!published);
      if (published) setCustomised(true);
    }
  }

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="key" value={sectionKey} />
      <input type="hidden" name="return_to" value={returnTo} />
      <input type="hidden" name="json" value={JSON.stringify(value)} />

      <div className={`${ui.card} p-6`}>
        <Field
          name={sectionKey}
          path={sectionKey}
          label={null}
          template={template}
          value={value}
          onChange={(next) => {
            setDirty(true);
            setValue(next);
          }}
          library={library}
        />
      </div>

      <div className={`${ui.card} grid gap-3 border-t-[5px] border-t-sky-brand p-4`}>
        <Notice state={state} />
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" name="intent" value="publish" disabled={pending} className={ui.publish}>
            {pending ? "Saving…" : "Publish to the website"}
          </button>
          <button type="submit" name="intent" value="draft" disabled={pending} className={ui.secondary}>
            Save draft
          </button>
          {previewHref &&
            (dirty ? (
              <span className="text-sm text-muted">Save the draft to preview it.</span>
            ) : (
              <Link href={previewHref} target="_blank" className={ui.small}>
                Preview {draft ? "the draft" : "the page"} ↗
              </Link>
            ))}
          <p className="mr-auto text-sm text-muted">
            {dirty
              ? "You have unsaved changes."
              : draft
                ? "A draft is saved. The website still shows the last published text."
                : customised
                  ? "The website shows this text."
                  : "The website shows the original text."}
          </p>
          {(customised || draft) &&
            (confirmReset ? (
              <span className="inline-flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-red-800">
                  Throw away your version and show the original text?
                </span>
                <button
                  type="submit"
                  name="intent"
                  value="reset"
                  disabled={pending}
                  className="inline-flex items-center bg-red-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
                >
                  Yes, reset
                </button>
                <button type="button" className={ui.small} onClick={() => setConfirmReset(false)}>
                  Cancel
                </button>
              </span>
            ) : (
              <button type="button" className={ui.danger} onClick={() => setConfirmReset(true)}>
                Reset to original
              </button>
            ))}
        </div>
      </div>
    </form>
  );
}
