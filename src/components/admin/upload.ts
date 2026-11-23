const MAX_SIDE = 2400;
const WORTH_SHRINKING = 500 * 1024;

/**
 * Photos straight from a camera are far larger than a web page needs and slow
 * the site down for every visitor. Before uploading, a big PNG or JPG is
 * scaled to at most 2400 pixels on its long side and saved as WebP. Small
 * images, GIFs (which may be animated) and anything the browser cannot shrink
 * are sent as they are, as is the original whenever shrinking did not help.
 */
async function shrink(file: File): Promise<File> {
  if (!/^image\/(png|jpeg)$/.test(file.type) || file.size < WORTH_SHRINKING) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.86),
    );
    if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file;
  }
}

/** Sends one image to the server. Returns its web address, or an error message. */
export async function uploadImage(
  file: File,
): Promise<{ url: string } | { error: string }> {
  const fallback = "The image could not be uploaded. Please try again.";
  file = await shrink(file);
  if (file.size > 4 * 1024 * 1024) {
    return { error: "That image is larger than 4 MB. Please choose a smaller one." };
  }
  try {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/admin/api/media", { method: "POST", body });
    const data = await response.json().catch(() => null);
    if (response.ok && typeof data?.url === "string") return { url: data.url };
    return { error: typeof data?.error === "string" ? data.error : fallback };
  } catch {
    return { error: fallback };
  }
}
