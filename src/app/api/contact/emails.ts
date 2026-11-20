import { contactEmails, focusAreas, site } from "@/content/site";

/**
 * Builds the two emails the contact form sends.
 *
 * Email clients ignore stylesheets and modern layout, so everything here is
 * tables with inline styles. The colours and shapes follow the website:
 * navy bands, three sky bars, square corners, a sky edge on panels.
 */

export type Enquiry = {
  name: string;
  email: string;
  company: string;
  message: string;
  receivedAt: Date;
};

export type Email = { subject: string; text: string; html: string };

const colour = {
  navy950: "#000b2e",
  navy800: "#00205b",
  sky: "#00aeef",
  skySoft: "#8fdcf9",
  paper: "#f4f8fb",
  line: "#d7e1ec",
  ink: "#0a1a3f",
  muted: "#4b5b78",
  page: "#e7edf4",
};

// Archivo, IBM Plex Sans and IBM Plex Mono are not installed on most devices,
// so each stack falls back to a font of a similar shape.
const font = {
  display: "'Arial Narrow', Arial, Helvetica, sans-serif",
  sans: "Arial, 'Segoe UI', Helvetica, sans-serif",
  mono: "Consolas, 'Courier New', monospace",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** The first word of a name, so greetings read naturally. */
function firstName(name: string) {
  const trimmed = name.trim();
  return trimmed.split(/\s+/)[0] || trimmed;
}

function fill(template: string, name: string) {
  return template.replace(/\{name\}/g, name);
}

function formatWhen(date: Date, timeZone: string) {
  // Spelled out field by field: "dateStyle" and "timeStyle" cannot be
  // combined with "timeZoneName", and doing so throws.
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  };
  try {
    return new Intl.DateTimeFormat("en-GB", { ...options, timeZone }).format(
      date,
    );
  } catch {
    // An unusable CONTACT_TIMEZONE must not stop the email going out.
    return new Intl.DateTimeFormat("en-GB", options).format(date);
  }
}

/** Keeps the sender's line breaks without letting their text become markup. */
function messageHtml(message: string) {
  const blocks = escapeHtml(message).split(/\n{2,}/);
  return blocks
    .map((block, index) => {
      const gap = index === blocks.length - 1 ? "0" : "14px";
      return `<p style="margin:0 0 ${gap};font-family:${font.sans};font-size:16px;line-height:1.65;color:${colour.ink};">${block.replace(/\n/g, "<br />")}</p>`;
    })
    .join("");
}

/** The three sky bars that sit beside every eyebrow on the website. */
const bars = `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
  <tr><td height="3" style="height:3px;width:20px;line-height:3px;font-size:0;background-color:${colour.sky};">&nbsp;</td></tr>
  <tr><td height="3" style="height:3px;line-height:3px;font-size:0;">&nbsp;</td></tr>
  <tr><td height="3" style="height:3px;width:20px;line-height:3px;font-size:0;background-color:${colour.sky};">&nbsp;</td></tr>
  <tr><td height="3" style="height:3px;line-height:3px;font-size:0;">&nbsp;</td></tr>
  <tr><td height="3" style="height:3px;width:20px;line-height:3px;font-size:0;background-color:${colour.sky};">&nbsp;</td></tr>
</table>`;

/** The wordmark, with the N and D picked out in sky blue. */
const wordmark = `<span style="font-family:${font.display};font-size:27px;font-weight:bold;letter-spacing:1.2px;color:#ffffff;">E<span style="color:${colour.sky};">N</span>ER<span style="color:${colour.sky};">D</span>I</span>`;

/** A paper panel with the sky edge, as used for notes on the website. */
function panel(inner: string) {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
  <tr>
    <td width="6" bgcolor="${colour.sky}" style="width:6px;background-color:${colour.sky};font-size:0;line-height:0;">&nbsp;</td>
    <td bgcolor="${colour.paper}" style="background-color:${colour.paper};padding:22px 24px;">${inner}</td>
  </tr>
</table>`;
}

function sectionLabel(text: string) {
  return `<p style="margin:0 0 12px;font-family:${font.mono};font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:${colour.muted};">${escapeHtml(text)}</p>`;
}

function detailRow(label: string, valueHtml: string, last = false) {
  const border = last ? "" : `border-bottom:1px solid ${colour.line};`;
  return `
<tr>
  <td style="padding:13px 0;${border}">
    <p style="margin:0 0 5px;font-family:${font.mono};font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:${colour.muted};">${escapeHtml(label)}</p>
    <div style="font-family:${font.sans};font-size:16px;line-height:1.5;color:${colour.ink};">${valueHtml}</div>
  </td>
</tr>`;
}

function button(href: string, label: string) {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
  <tr>
    <td bgcolor="${colour.navy800}" style="background-color:${colour.navy800};">
      <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;font-family:${font.sans};font-size:15px;font-weight:bold;letter-spacing:0.3px;color:#ffffff;text-decoration:none;">${escapeHtml(label)}</a>
    </td>
  </tr>
</table>`;
}

/** Only a real web address belongs in a button, whatever SITE_URL holds. */
function webLink(value: string | null) {
  if (!value) return null;
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

function spacer(height: number) {
  return `<div style="height:${height}px;line-height:${height}px;font-size:0;">&nbsp;</div>`;
}

/** The navy header, white body and navy footer shared by both emails. */
function shell(parts: {
  preheader: string;
  eyebrow: string;
  heading: string;
  content: string;
  footerNote: string;
}) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${escapeHtml(parts.heading)}</title>
</head>
<body style="margin:0;padding:0;width:100%;background-color:${colour.page};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${colour.page};">${escapeHtml(parts.preheader)}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${colour.page};">
    <tr>
      <td align="center" style="padding:28px 12px;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:600px;max-width:600px;background-color:#ffffff;">

          <tr>
            <td bgcolor="${colour.navy950}" style="background-color:${colour.navy950};padding:22px 32px;">
              ${wordmark}
            </td>
          </tr>

          <tr>
            <td bgcolor="${colour.navy800}" style="background-color:${colour.navy800};padding:34px 32px 38px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td valign="middle" style="padding-right:12px;">${bars}</td>
                  <td valign="middle" style="font-family:${font.mono};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${colour.skySoft};">${escapeHtml(parts.eyebrow)}</td>
                </tr>
              </table>
              <h1 style="margin:18px 0 0;font-family:${font.display};font-size:32px;line-height:1.12;font-weight:bold;color:#ffffff;">${escapeHtml(parts.heading)}</h1>
            </td>
          </tr>

          <tr>
            <td style="padding:34px 32px 38px;">${parts.content}</td>
          </tr>

          <tr>
            <td bgcolor="${colour.navy950}" style="background-color:${colour.navy950};padding:26px 32px;">
              <p style="margin:0;font-family:${font.display};font-size:15px;font-weight:bold;letter-spacing:0.4px;color:#ffffff;">${escapeHtml(site.tagline)}</p>
              <p style="margin:10px 0 0;font-family:${font.sans};font-size:13px;line-height:1.6;color:#9fb0cc;">${escapeHtml(parts.footerNote)}</p>
              <p style="margin:14px 0 0;font-family:${font.mono};font-size:11px;color:#6d80a3;">${escapeHtml(site.copyright)}</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** The enquiry, as it reaches the ENERDI inbox. */
export function adminEmail(enquiry: Enquiry, timeZone: string): Email {
  const copy = contactEmails.admin;
  const greeting = firstName(enquiry.name);
  const when = formatWhen(enquiry.receivedAt, timeZone);
  const company = enquiry.company || "Not given";
  const mailto = `mailto:${enquiry.email}?subject=${encodeURIComponent(
    `Re: your enquiry to ${site.name}`,
  )}`;

  const content = `
<p style="margin:0 0 26px;font-family:${font.sans};font-size:16px;line-height:1.65;color:${colour.muted};">${escapeHtml(copy.intro)}</p>

${sectionLabel(copy.detailsLabel)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-top:1px solid ${colour.line};">
  ${detailRow("Name", escapeHtml(enquiry.name))}
  ${detailRow(
    "Email",
    `<a href="mailto:${escapeHtml(enquiry.email)}" style="color:${colour.navy800};text-decoration:underline;">${escapeHtml(enquiry.email)}</a>`,
  )}
  ${detailRow("Company", escapeHtml(company))}
  ${detailRow("Received", escapeHtml(when), true)}
</table>

${spacer(30)}

${sectionLabel(copy.messageLabel)}
${panel(messageHtml(enquiry.message))}

${spacer(30)}

${button(mailto, fill(copy.action, greeting))}`;

  const text = [
    fill(copy.heading, greeting),
    "",
    copy.intro,
    "",
    `Name:     ${enquiry.name}`,
    `Email:    ${enquiry.email}`,
    `Company:  ${company}`,
    `Received: ${when}`,
    "",
    `${copy.messageLabel}:`,
    enquiry.message,
    "",
    "--",
    site.tagline,
    copy.footerNote,
  ].join("\n");

  return {
    subject: fill(copy.subject, enquiry.name),
    text,
    html: shell({
      preheader: fill(copy.preheader, enquiry.name),
      eyebrow: copy.eyebrow,
      heading: fill(copy.heading, greeting),
      content,
      footerNote: copy.footerNote,
    }),
  };
}

/** The confirmation the visitor receives. */
export function visitorEmail(enquiry: Enquiry, siteUrl: string | null): Email {
  const copy = contactEmails.visitor;
  const greeting = firstName(enquiry.name);
  const link = webLink(siteUrl);

  const paragraphs = copy.paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;font-family:${font.sans};font-size:16px;line-height:1.65;color:${colour.muted};">${escapeHtml(paragraph)}</p>`,
    )
    .join("");

  const areas = focusAreas
    .map((area, index) => {
      const border =
        index === focusAreas.length - 1
          ? ""
          : `border-bottom:1px solid ${colour.line};`;
      return `
<tr>
  <td style="padding:12px 0;${border}">
    <p style="margin:0 0 3px;font-family:${font.display};font-size:16px;font-weight:bold;letter-spacing:0.2px;color:${colour.navy800};">${escapeHtml(area.title)}</p>
    <p style="margin:0;font-family:${font.sans};font-size:14px;line-height:1.6;color:${colour.muted};">${escapeHtml(area.text)}</p>
  </td>
</tr>`;
    })
    .join("");

  const content = `
${paragraphs}

${spacer(14)}

${sectionLabel(copy.recapLabel)}
${panel(messageHtml(enquiry.message))}

${spacer(32)}

${sectionLabel(copy.focusLabel)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-top:1px solid ${colour.line};">
  ${areas}
</table>
${link ? `\n${spacer(32)}\n${button(link, copy.action)}` : ""}`;

  const text = [
    fill(copy.heading, greeting),
    "",
    ...copy.paragraphs,
    "",
    `${copy.recapLabel}:`,
    enquiry.message,
    "",
    `${copy.focusLabel}:`,
    ...focusAreas.map((area) => `- ${area.title}: ${area.text}`),
    ...(link ? ["", `${copy.action}: ${link}`] : []),
    "",
    "--",
    site.tagline,
    copy.footerNote,
  ].join("\n");

  return {
    subject: copy.subject,
    text,
    html: shell({
      preheader: copy.preheader,
      eyebrow: copy.eyebrow,
      heading: fill(copy.heading, greeting),
      content,
      footerNote: copy.footerNote,
    }),
  };
}
