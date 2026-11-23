import { readMedia, readMediaVersion } from "@/lib/media";

const etagOf = (updatedAt: Date, bytes: number) =>
  `"${new Date(updatedAt).getTime()}-${bytes}"`;

const commonHeaders = {
  // Browsers reuse their copy for five minutes, then ask whether it is still
  // current (a tiny request, answered without sending the image again). So a
  // replaced image reaches returning visitors within five minutes.
  "Cache-Control": "public, max-age=300, must-revalidate",
  "X-Content-Type-Options": "nosniff",
  // An uploaded file is only ever an image: it may not run scripts or load anything.
  "Content-Security-Policy": "default-src 'none'; sandbox",
};

/** Serves an image that was uploaded through the admin panel. */
export async function GET(request: Request, context: RouteContext<"/media/[id]">) {
  const { id } = await context.params;
  if (!/^[\w-]{6,40}\.(png|jpg|gif|webp)$/.test(id)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    // "Is my copy still good?" is answered from two small columns, so the
    // image itself is only read from the database when it has to be sent.
    const known = request.headers.get("if-none-match");
    if (known) {
      const version = await readMediaVersion(id);
      if (!version) return new Response("Not found", { status: 404 });
      const etag = etagOf(version.updated_at, version.bytes);
      if (known === etag) {
        return new Response(null, { status: 304, headers: { ...commonHeaders, ETag: etag } });
      }
    }

    const item = await readMedia(id);
    if (!item) return new Response("Not found", { status: 404 });
    return new Response(new Uint8Array(item.data), {
      headers: {
        ...commonHeaders,
        "Content-Type": item.mime,
        "Content-Length": String(item.data.length),
        ETag: etagOf(item.updated_at, item.data.length),
      },
    });
  } catch (error) {
    console.error("Media: the image could not be read.", error);
    return new Response("Temporarily unavailable", { status: 503 });
  }
}
