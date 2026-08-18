import sharp from "sharp";
import convert from "heic-convert";

// Anthropic recommends capping the long edge around this size for efficient
// vision token usage without losing legibility of slip text.
const MAX_DIMENSION = 1568;
const JPEG_QUALITY = 82;

const HEIC_BRANDS = new Set([
  "heic",
  "heix",
  "hevc",
  "heim",
  "heis",
  "hevm",
  "hevs",
  "mif1",
  "msf1",
]);

function looksLikeHeic(buffer: Buffer, mimeType: string | null): boolean {
  if (mimeType && /hei[cf]/i.test(mimeType)) return true;
  if (buffer.length < 12) return false;
  if (buffer.toString("ascii", 4, 8) !== "ftyp") return false;
  const brand = buffer.toString("ascii", 8, 12).toLowerCase();
  return HEIC_BRANDS.has(brand);
}

export interface PreprocessedImage {
  buffer: Buffer;
  contentType: string;
  extension: string;
}

/**
 * Normalizes any uploaded slip photo (HEIC from iPhones, arbitrary
 * resolution/orientation from any camera) into a modest-size, EXIF-corrected
 * JPEG. The same output is used both for what we store on disk and what we
 * send to the vision API, so what the user sees back matches what got read.
 */
export async function preprocessSlipImage(
  input: Buffer,
  mimeType: string | null
): Promise<PreprocessedImage> {
  let working: Buffer = input;

  if (looksLikeHeic(input, mimeType)) {
    const converted = await convert({
      buffer: input,
      format: "JPEG",
      quality: 0.92,
    });
    working = Buffer.from(converted);
  }

  const resized = await sharp(working)
    .rotate()
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: JPEG_QUALITY })
    .toBuffer();

  return { buffer: resized, contentType: "image/jpeg", extension: "jpg" };
}
