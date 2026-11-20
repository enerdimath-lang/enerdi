import nodemailer from "nodemailer";
import { site } from "@/content/site";
import { adminEmail, visitorEmail, type Enquiry } from "./emails";
import { overLimit, recordUse, type Allowance } from "./rate-limit";

/**
 * Receives the contact form, emails the enquiry to ENERDI and sends the
 * person who wrote in a confirmation.
 * Settings come from `.env.local` (see `.env.example`).
 */

const DEFAULT_RECIPIENT = "mettadivya528@gmail.com";

const limits = { name: 120, email: 200, company: 160, message: 5000 };

/** How many enquiries one visitor, or one recipient, may trigger per window. */
const MAX_PER_VISITOR = 5;
const MAX_PER_RECIPIENT = 3;

/** The fields together cap out well below this, so anything larger is junk. */
const MAX_BODY_BYTES = 32 * 1024;

/** Reads a setting, treating a blank value the same as a missing one. */
function setting(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Keeps a value on one line so it is safe in an email header. */
function oneLine(value: string) {
  return value.replace(/[\r\n]+/g, " ");
}

/** A display name that cannot break out of an address header. */
function headerName(value: string) {
  return value.replace(/["\\]/g, "'");
}

/**
 * Reads the body, giving up once it passes the limit, so a very large request
 * cannot be held in memory. Returns null when the body is too big or absent.
 */
async function readBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) return null;

  const decoder = new TextDecoder();
  let text = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    if (text.length > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
  }

  return text + decoder.decode();
}

/** Who sent this, as far as any proxy in front of the site reports it. */
function visitorKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0];
  const ip = forwarded?.trim() || request.headers.get("x-real-ip")?.trim();
  return `visitor:${ip || "unknown"}`;
}

export async function POST(request: Request) {
  const raw = await readBody(request);
  if (raw === null) {
    return Response.json({ error: "That message is too long." }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Hidden field that people never fill in. Bots do, so we quietly drop those.
  if (clean(body.website, 200)) {
    return Response.json({ ok: true });
  }

  const name = oneLine(clean(body.name, limits.name));
  const email = oneLine(clean(body.email, limits.email));
  const company = oneLine(clean(body.company, limits.company));
  const message = clean(body.message, limits.message);

  // The excluded characters are the ones that carry meaning in an address
  // header. No ordinary address contains them.
  const looksLikeAddress = /^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/.test(
    email,
  );

  if (!name || !message || !looksLikeAddress) {
    return Response.json(
      { error: "Please fill in your name, a valid email and a message." },
      { status: 400 },
    );
  }

  // A confirmation goes to whatever address was typed in, so cap both how
  // often one visitor may send and how often one address may be written to.
  const allowances: Allowance[] = [
    { key: visitorKey(request), limit: MAX_PER_VISITOR },
    { key: `recipient:${email.toLowerCase()}`, limit: MAX_PER_RECIPIENT },
  ];

  if (overLimit(allowances)) {
    return Response.json(
      { error: "Too many messages have been sent. Please try again later." },
      { status: 429 },
    );
  }

  const user = setting("SMTP_USER");
  const password = setting("SMTP_PASSWORD");
  if (!user || !password) {
    console.error(
      "Contact form: SMTP_USER and SMTP_PASSWORD are not set in .env.local.",
    );
    return Response.json(
      { error: "The contact form is not set up yet." },
      { status: 503 },
    );
  }

  // A blank or misspelt port must not silently become port 0.
  const configured = Number(setting("SMTP_PORT"));
  const port = Number.isInteger(configured) && configured > 0 ? configured : 465;

  const transporter = nodemailer.createTransport({
    host: setting("SMTP_HOST") ?? "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user, pass: password },
  });

  const enquiry: Enquiry = {
    name,
    email,
    company,
    message,
    receivedAt: new Date(),
  };
  const office = setting("CONTACT_TO") ?? DEFAULT_RECIPIENT;

  const forOffice = adminEmail(
    enquiry,
    setting("CONTACT_TIMEZONE") ?? "Asia/Kolkata",
  );
  const forVisitor = visitorEmail(enquiry, setting("SITE_URL") ?? null);

  recordUse(allowances);

  // The enquiry itself has to arrive. The confirmation is a courtesy, so a
  // failure there is logged but never loses the enquiry.
  const [officeResult, visitorResult] = await Promise.allSettled([
    transporter.sendMail({
      from: `"${site.name} website" <${user}>`,
      to: office,
      replyTo: `"${headerName(name)}" <${email}>`,
      subject: forOffice.subject,
      text: forOffice.text,
      html: forOffice.html,
    }),
    transporter.sendMail({
      from: `"${site.name}" <${user}>`,
      to: `"${headerName(name)}" <${email}>`,
      replyTo: office,
      subject: forVisitor.subject,
      text: forVisitor.text,
      html: forVisitor.html,
      headers: {
        // Stops holiday responders and the like bouncing back and forth.
        "Auto-Submitted": "auto-replied",
        "X-Auto-Response-Suppress": "All",
      },
    }),
  ]);

  if (officeResult.status === "rejected") {
    console.error(
      "Contact form: the enquiry could not be sent.",
      officeResult.reason,
    );
    return Response.json(
      { error: "Your message could not be sent. Please try again." },
      { status: 502 },
    );
  }

  if (visitorResult.status === "rejected") {
    console.error(
      `Contact form: the enquiry from ${email} arrived, but their confirmation could not be sent.`,
      visitorResult.reason,
    );
  }

  return Response.json({ ok: true });
}
