import { logActivity } from "@/lib/activity";
import { getAdmin, type Admin } from "@/lib/auth";
import { MAX_IMAGE_BYTES, mediaUrl, replaceImage, storeImage } from "@/lib/media";

const tooLarge = Response.json(
  { error: "That image is larger than 4 MB. Please choose a smaller one." },
  { status: 413 },
);

/**
 * The checks every upload goes through: signed in, sent from this site, within
 * the size limit. Returns the admin and the file, or the response to send back.
 */
async function receive(request: Request): Promise<{ admin: Admin; file: File } | Response> {
  const admin = await getAdmin();
  if (!admin) {
    return Response.json({ error: "Please sign in again." }, { status: 401 });
  }

  // The session cookie is not sent by other websites, and this makes sure of it.
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    return Response.json({ error: "Invalid request." }, { status: 403 });
  }

  if (Number(request.headers.get("content-length")) > MAX_IMAGE_BYTES + 64 * 1024) {
    return tooLarge.clone();
  }

  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get("file");
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "Choose an image to upload." }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_BYTES) return tooLarge.clone();
  return { admin, file };
}

const wrongType = () =>
  Response.json(
    { error: "Only PNG, JPG, GIF and WebP images can be uploaded." },
    { status: 415 },
  );

const failed = () =>
  Response.json(
    { error: "The image could not be saved. Check the database and try again." },
    { status: 500 },
  );

/** Stores one new image from the admin panel. */
export async function POST(request: Request) {
  const received = await receive(request);
  if (received instanceof Response) return received;
  const { admin, file } = received;

  try {
    const stored = await storeImage(file.name, Buffer.from(await file.arrayBuffer()));
    if (!stored) return wrongType();
    await logActivity(admin, "Uploaded image", "Media", stored.filename);
    return Response.json({ ...stored, url: mediaUrl(stored) });
  } catch (error) {
    console.error("Media: the upload could not be stored.", error);
    return failed();
  }
}

/** Replaces the picture behind an existing image, keeping its address. */
export async function PUT(request: Request) {
  const received = await receive(request);
  if (received instanceof Response) return received;
  const { admin, file } = received;

  const id = new URL(request.url).searchParams.get("id") ?? "";
  try {
    const kind = await replaceImage(id, Buffer.from(await file.arrayBuffer()));
    if (!kind) {
      // Either the file is not an image, or there is no image with that id.
      return wrongType();
    }
    await logActivity(admin, "Replaced image", "Media", id);
    return Response.json({ id, url: mediaUrl({ id }) });
  } catch (error) {
    console.error("Media: the image could not be replaced.", error);
    return failed();
  }
}
