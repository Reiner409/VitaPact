import { imageSizeLimits, readQrCode, type QrReadError } from '@vitapact/core/report';
import { getPlatform, NotAnImageError, readImagePixels } from '@vitapact/platform';

export type PickError = QrReadError | 'notAnImage';

/** What came out of the image the user chose: nothing, the QR content, or why there is none. */
export type PickedReport =
  | { kind: 'cancelled' }
  | { kind: 'content'; content: Uint8Array }
  | { kind: 'failed'; reason: PickError };

/** Opens the image a friend sent; tests pass their own. */
export type PickReport = (filterName: string) => Promise<PickedReport>;

async function openImage(filterName: string) {
  try {
    return await getPlatform().openImageFile(filterName);
  } catch (error) {
    if (error instanceof NotAnImageError) return 'notAnImage' as const;
    throw error;
  }
}

/** Reads the image a friend sent, chosen or pasted; tests pass their own. */
export type ReadReportImage = (image: Blob) => Promise<PickedReport>;

/** RF-12: the image is untrusted, so platform checks its size and core reads only the QR code. */
export const readReportImage: ReadReportImage = async (image) => {
  const pixels = await readImagePixels(image, imageSizeLimits);
  if (!pixels.ok) return { kind: 'failed', reason: pixels.error };
  const qr = readQrCode(pixels.pixels);
  return qr.ok ? { kind: 'content', content: qr.content } : { kind: 'failed', reason: qr.error };
};

export const pickReportFromImage: PickReport = async (filterName) => {
  const image = await openImage(filterName);
  if (image === undefined) return { kind: 'cancelled' };
  if (image === 'notAnImage') return { kind: 'failed', reason: 'notAnImage' };
  return readReportImage(new Blob([image.bytes], { type: image.mimeType }));
};

const IMAGE_TYPES = ['image/png', 'image/jpeg'];

/** The first PNG or JPG among pasted items, e.g. an image copied from a chat. */
export function pastedImage(data: DataTransfer | null): Blob | 'notAnImage' | undefined {
  const files = [...(data?.files ?? [])];
  if (files.length === 0) return undefined;
  return files.find((file) => IMAGE_TYPES.includes(file.type)) ?? 'notAnImage';
}
