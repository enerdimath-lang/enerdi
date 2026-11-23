import type { ReactNode } from "react";

/**
 * Renders the simple formatting used in articles and blog posts.
 *
 * It builds React elements directly and never injects raw HTML, so whatever
 * is typed into an article cannot run scripts on the site.
 *
 * Supported: "# Heading" and "## Sub-heading", **bold**, *italic*, `code`,
 * [links](https://...), ![images](/media/...), "- " and "1. " lists,
 * "> " quotes, "---" dividers and ``` code blocks.
 */

/** Only ordinary web, mail and on-site addresses are allowed in links and images. */
function safeUrl(url: string) {
  const value = url.trim();
  if (/^(https?:\/\/|mailto:|tel:)/i.test(value)) return value;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  if (value.startsWith("#")) return value;
  return null;
}

const INLINE =
  /(!\[([^\]]*)\]\(([^)\s]+)\))|(\[([^\]]+)\]\(([^)\s]+)\))|(\*\*([^*]+)\*\*)|(\*([^*\n]+)\*)|(`([^`]+)`)/;

function inline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let rest = text;
  let index = 0;

  while (rest) {
    const match = INLINE.exec(rest);
    if (!match) {
      nodes.push(rest);
      break;
    }
    if (match.index > 0) nodes.push(rest.slice(0, match.index));
    const key = `${keyPrefix}-${index++}`;

    if (match[1]) {
      const src = safeUrl(match[3]);
      nodes.push(
        src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={key} src={src} alt={match[2]} loading="lazy" />
        ) : (
          match[2]
        ),
      );
    } else if (match[4]) {
      const href = safeUrl(match[6]);
      const external = href ? /^https?:/i.test(href) : false;
      nodes.push(
        href ? (
          <a
            key={key}
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {inline(match[5], key)}
          </a>
        ) : (
          match[5]
        ),
      );
    } else if (match[7]) {
      nodes.push(<strong key={key}>{inline(match[8], key)}</strong>);
    } else if (match[9]) {
      nodes.push(<em key={key}>{inline(match[10], key)}</em>);
    } else if (match[11]) {
      nodes.push(<code key={key}>{match[12]}</code>);
    }

    rest = rest.slice(match.index + match[0].length);
  }
  return nodes;
}

const IMAGE_LINE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;
const BULLET = /^\s*[-*]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;
const startsBlock = (line: string) =>
  /^(#{1,3}\s|>\s?|```|---+\s*$)/.test(line) ||
  BULLET.test(line) ||
  NUMBERED.test(line) ||
  IMAGE_LINE.test(line.trim());

function blocks(source: string): ReactNode[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const out: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const key = `b${i}`;

    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1;
      out.push(
        <pre key={key}>
          <code>{code.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      // The page title is the h1, so headings inside the text start at h2.
      const Tag = (["h2", "h3", "h4"] as const)[heading[1].length - 1];
      out.push(<Tag key={key}>{inline(heading[2].trim(), key)}</Tag>);
      i += 1;
      continue;
    }

    if (/^---+\s*$/.test(line)) {
      out.push(<hr key={key} />);
      i += 1;
      continue;
    }

    const image = IMAGE_LINE.exec(line.trim());
    if (image) {
      const src = safeUrl(image[2]);
      if (src) {
        out.push(
          <figure key={key}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={image[1]} loading="lazy" />
            {image[1] && <figcaption>{image[1]}</figcaption>}
          </figure>,
        );
      }
      i += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      out.push(<blockquote key={key}>{inline(quote.join(" "), key)}</blockquote>);
      continue;
    }

    let wasList = false;
    for (const [pattern, Tag] of [
      [BULLET, "ul"],
      [NUMBERED, "ol"],
    ] as const) {
      if (!pattern.test(line)) continue;
      const items: string[] = [];
      while (i < lines.length && pattern.test(lines[i])) {
        items.push(pattern.exec(lines[i])![1]);
        i += 1;
      }
      out.push(
        <Tag key={key}>
          {items.map((item, n) => (
            <li key={n}>{inline(item, `${key}-${n}`)}</li>
          ))}
        </Tag>,
      );
      wasList = true;
      break;
    }
    if (wasList) continue;

    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim() && !startsBlock(lines[i])) {
      paragraph.push(lines[i].trim());
      i += 1;
    }
    if (paragraph.length === 0) {
      // A line that looks like a block start but matched nothing above.
      paragraph.push(line.trim());
      i += 1;
    }
    out.push(<p key={key}>{inline(paragraph.join(" "), key)}</p>);
  }
  return out;
}

export function Markdown({ source, className = "" }: { source: string; className?: string }) {
  return <div className={`prose-enerdi ${className}`}>{blocks(source)}</div>;
}
