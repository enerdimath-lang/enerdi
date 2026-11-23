import "server-only";
import { defaults } from "@/content/sections";
import { listMedia, mediaUrl } from "./media";

/** Every image the admin can pick from: uploads first, then the built-in slide art. */
export async function getImageLibrary() {
  const uploads = await listMedia();
  return [
    ...uploads.map((item) => ({ url: mediaUrl(item), filename: item.filename, alt: item.alt })),
    ...defaults.slides.map((slide) => ({
      url: slide.image,
      filename: `${slide.title} (built in)`,
      alt: "",
    })),
  ];
}
