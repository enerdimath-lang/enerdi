"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { savePostAction } from "@/app/admin/actions";
import { Markdown } from "@/components/Markdown";
import { slugify } from "@/lib/slug";
import { ImageField, type LibraryImage } from "./ImageField";
import { Notice } from "./Notice";
import { postSeoNames, SeoFields, type SeoValues } from "./SeoFields";
import { ui } from "./ui";
import { uploadImage } from "./upload";

export type PostFormValues = {
  id: number | null;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  topic: string;
  cover_url: string;
  author: string;
  tags: string;
  status: "draft" | "published" | "unpublished";
  seo: SeoValues;
};

const statusLine = {
  published: "Live on the website",
  draft: "Draft, not visible",
  unpublished: "Unpublished, not visible",
};

/** Why "Publish" in the list did not publish. */
const blockedMessages: Record<string, string> = {
  "blocked-empty": "This was not published: there is no text yet. Write something, then press Publish.",
  "blocked-noindex":
    'This was not published: it is set to be hidden from search engines. Under "SEO and social sharing", untick that option or confirm it, then press Publish.',
};

const savedMessages: Record<string, string> = {
  published: "Published. It is live on the website now.",
  draft: "Saved as a draft. Visitors cannot see it.",
  unpublished: "Unpublished. Visitors can no longer see it.",
};

type Kind = {
  type: "article" | "blog";
  singular: string;
  /** Public address, such as "/knowledge-hub". */
  path: string;
  /** Admin address of the list, such as "/admin/posts/articles". */
  adminPath: string;
  /** "Topic" for articles, "Category" for blog posts. */
  groupLabel: string;
};

type Wrap = { before: string; after?: string; placeholder: string; block?: boolean };

const tools: { label: string; title: string; wrap: Wrap }[] = [
  { label: "Heading", title: "Section heading", wrap: { before: "# ", placeholder: "Heading", block: true } },
  { label: "Sub-heading", title: "Smaller heading", wrap: { before: "## ", placeholder: "Sub-heading", block: true } },
  { label: "Bold", title: "Bold", wrap: { before: "**", after: "**", placeholder: "bold text" } },
  { label: "Italic", title: "Italic", wrap: { before: "*", after: "*", placeholder: "italic text" } },
  { label: "Link", title: "Link", wrap: { before: "[", after: "](https://)", placeholder: "link text" } },
  { label: "List", title: "Bulleted list", wrap: { before: "- ", placeholder: "List item", block: true } },
  { label: "Numbered", title: "Numbered list", wrap: { before: "1. ", placeholder: "List item", block: true } },
  { label: "Quote", title: "Quote", wrap: { before: "> ", placeholder: "Quote", block: true } },
];

export function PostForm({
  kind,
  post,
  topics,
  library,
  savedNotice,
}: {
  kind: Kind;
  post: PostFormValues;
  topics: string[];
  library: LibraryImage[];
  savedNotice?: string;
}) {
  const [state, action, pending] = useActionState(savePostAction, null);
  const [values, setValues] = useState(post);
  const [slugTouched, setSlugTouched] = useState(Boolean(post.id));
  const [preview, setPreview] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);

  // What the server last confirmed, so the status line and buttons are right.
  const [status, setStatus] = useState(post.status);
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    if (state?.ok) {
      setDirty(false);
      setStatus(
        state.ok.startsWith("Published")
          ? "published"
          : state.ok.startsWith("Unpublished")
            ? "unpublished"
            : status,
      );
    }
  }

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function set<K extends keyof PostFormValues>(key: K, value: PostFormValues[K]) {
    setDirty(true);
    setValues((current) => {
      const next = { ...current, [key]: value };
      if (key === "title" && !slugTouched) next.slug = slugify(String(value));
      return next;
    });
  }

  /** Puts formatting around the selected text, or inserts an example. */
  function insert({ before, after = "", placeholder, block }: Wrap) {
    const area = bodyRef.current;
    if (!area) return;
    const { selectionStart: start, selectionEnd: end, value } = area;
    const selected = value.slice(start, end) || placeholder;
    const needsBreak = block && start > 0 && value[start - 1] !== "\n";
    const lead = needsBreak ? "\n\n" : "";
    const text = `${lead}${before}${selected}${after}`;
    set("body", value.slice(0, start) + text + value.slice(end));

    const from = start + lead.length + before.length;
    requestAnimationFrame(() => {
      area.focus();
      area.setSelectionRange(from, from + selected.length);
    });
  }

  async function insertImage(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const result = await uploadImage(file);
    setUploading(false);
    if (imageInput.current) imageInput.current.value = "";
    if ("error" in result) {
      setUploadError(result.error);
      return;
    }
    const caption = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
    // An image goes in after the cursor rather than around the selected text.
    const area = bodyRef.current;
    if (area) area.setSelectionRange(area.selectionEnd, area.selectionEnd);
    insert({ before: `![${caption}](${result.url})\n\n`, placeholder: "", block: true });
  }

  const address = `${kind.path}/${values.slug || slugify(values.title) || "…"}`;
  const isLive = status === "published";

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
      <input type="hidden" name="type" value={kind.type} />
      <input type="hidden" name="id" value={values.id ?? ""} />

      <div className="grid gap-6">
        <Notice
          state={
            state ??
            (savedNotice && savedMessages[savedNotice]
              ? { ok: savedMessages[savedNotice] }
              : savedNotice && blockedMessages[savedNotice]
                ? { error: blockedMessages[savedNotice] }
                : null)
          }
        />

        <div className={`${ui.card} grid gap-5 p-6`}>
          <label className={ui.label}>
            Title
            <input
              name="title"
              value={values.title}
              onChange={(event) => set("title", event.target.value)}
              required
              maxLength={200}
              className={`${ui.input} text-xl font-semibold`}
            />
          </label>
          <label className={ui.label}>
            Summary
            <span className="font-normal text-muted">
              {" "}
              (one or two sentences, shown in lists and under the title)
            </span>
            <textarea
              name="excerpt"
              value={values.excerpt}
              onChange={(event) => set("excerpt", event.target.value)}
              rows={2}
              maxLength={400}
              className={ui.input}
            />
          </label>
        </div>

        <div className={ui.card}>
          <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
            <div role="tablist" aria-label="Editor" className="mr-2 flex">
              {[
                { label: "Write", on: !preview, show: false },
                { label: "Preview", on: preview, show: true },
              ].map((tab) => (
                <button
                  key={tab.label}
                  type="button"
                  role="tab"
                  aria-selected={tab.on}
                  onClick={() => setPreview(tab.show)}
                  className={`border px-4 py-1.5 text-sm font-semibold ${
                    tab.on
                      ? "border-navy-800 bg-navy-800 text-white"
                      : "border-line bg-white text-navy-800 hover:border-navy-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {!preview && (
              <>
                {tools.map((tool) => (
                  <button
                    key={tool.label}
                    type="button"
                    title={tool.title}
                    className={ui.small}
                    onClick={() => insert(tool.wrap)}
                  >
                    {tool.label}
                  </button>
                ))}
                <input
                  ref={imageInput}
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden="true"
                  onChange={(event) => insertImage(event.target.files?.[0])}
                />
                <button
                  type="button"
                  className={ui.small}
                  disabled={uploading}
                  onClick={() => imageInput.current?.click()}
                >
                  {uploading ? "Uploading…" : "Image"}
                </button>
              </>
            )}
          </div>
          {uploadError && (
            <p role="alert" className="px-4 pt-3 text-sm font-medium text-red-700">
              {uploadError}
            </p>
          )}

          {/* Kept in the form even while previewing, so it is always sent. */}
          <textarea
            ref={bodyRef}
            name="body"
            aria-label="Text"
            value={values.body}
            onChange={(event) => set("body", event.target.value)}
            rows={22}
            placeholder={"Write here.\n\nLeave an empty line between paragraphs. Use the buttons above for headings, bold text, links, lists and images."}
            className={`block w-full resize-y border-0 bg-white p-5 font-mono text-[0.95rem] leading-relaxed text-ink placeholder:text-muted/60 focus:outline-none ${
              preview ? "hidden" : ""
            }`}
          />
          {preview && (
            <div className="min-h-64 p-6">
              {values.body.trim() ? (
                <Markdown source={values.body} />
              ) : (
                <p className="text-muted">Nothing to preview yet.</p>
              )}
            </div>
          )}
        </div>

        <details className={ui.card}>
          <summary className="cursor-pointer px-6 py-4 text-lg font-extrabold text-navy-800">
            SEO and social sharing
          </summary>
          <div className="border-t border-line p-6">
            <SeoFields
              initial={post.seo}
              names={postSeoNames}
              fallbackTitle={values.title}
              fallbackDescription={values.excerpt}
              library={library}
              onChange={() => setDirty(true)}
            />
          </div>
        </details>
      </div>

      <aside className="grid gap-6 lg:sticky lg:top-20">
        <div className={`${ui.card} grid gap-4 p-5`}>
          <p className="flex items-center gap-3 font-mono text-xs tracking-[0.14em] uppercase">
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full ${isLive ? "bg-emerald-500" : "bg-amber-400"}`}
            />
            {values.id ? statusLine[status] : "New, not saved yet"}
          </p>
          {dirty && <p className="-mt-2 text-sm text-muted">You have unsaved changes.</p>}
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
                {status === "unpublished" ? "Save without publishing" : "Save draft"}
              </button>
            )}
          </div>
          {values.id && !dirty && (
            <Link
              href={`${kind.adminPath}/${values.id}/preview`}
              target="_blank"
              className="text-sm font-semibold text-navy-800 underline decoration-sky-brand decoration-2 underline-offset-4"
            >
              Preview as a visitor would see it ↗
            </Link>
          )}
          {values.id && dirty && (
            <p className="text-sm text-muted">Save first to preview the latest changes.</p>
          )}
          {isLive && values.slug && !dirty && (
            <Link
              href={`${kind.path}/${values.slug}`}
              target="_blank"
              className="text-sm font-semibold text-navy-800 underline decoration-sky-brand decoration-2 underline-offset-4"
            >
              View it on the website ↗
            </Link>
          )}
        </div>

        <div className={`${ui.card} grid gap-5 p-5`}>
          <label className={ui.label}>
            {kind.groupLabel}
            <input
              name="topic"
              list="post-topics"
              value={values.topic}
              onChange={(event) => set("topic", event.target.value)}
              maxLength={120}
              placeholder="Choose one or type a new one"
              className={ui.input}
            />
            <datalist id="post-topics">
              {topics.map((topic) => (
                <option key={topic} value={topic} />
              ))}
            </datalist>
          </label>
          <label className={ui.label}>
            Tags <span className="font-normal text-muted">(separate with commas)</span>
            <input
              name="tags"
              value={values.tags}
              onChange={(event) => set("tags", event.target.value)}
              maxLength={300}
              placeholder="digital twins, flow assurance"
              className={ui.input}
            />
          </label>
          <label className={ui.label}>
            Author
            <input
              name="author"
              value={values.author}
              onChange={(event) => set("author", event.target.value)}
              maxLength={120}
              className={ui.input}
            />
          </label>
          <label className={ui.label}>
            Web address
            <input
              name="slug"
              value={values.slug}
              onChange={(event) => {
                setSlugTouched(true);
                // Tidied as you type; the server finishes the job on save.
                set(
                  "slug",
                  event.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]+/g, "-")
                    .replace(/-{2,}/g, "-"),
                );
              }}
              maxLength={120}
              className={`${ui.input} font-mono text-sm`}
            />
            <span className="mt-1 block font-mono text-xs font-normal break-all text-muted">
              {address}
            </span>
          </label>
          <input type="hidden" name="cover_url" value={values.cover_url} />
          <ImageField
            label="Cover image"
            hint="Shown at the top and in lists. Wide pictures work best."
            value={values.cover_url}
            onChange={(url) => set("cover_url", url)}
            library={library}
          />
        </div>
      </aside>
    </form>
  );
}
