/** Pixels in RGBA order, as `ImageData` holds them. */
export interface ImagePixels {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8ClampedArray;
}

/** The caps for an untrusted image; core decides them, platform applies them. */
export interface ImageSizeLimits {
  fitsBytes(bytes: number): boolean;
  fitsDimensions(width: number, height: number): boolean;
}

export interface DecodedImage {
  readonly width: number;
  readonly height: number;
  pixels(): ImagePixels | undefined;
  close(): void;
}

export interface ImageDecoder {
  decode(image: Blob): Promise<DecodedImage>;
}

export type ImageReadError = 'imageTooLarge' | 'unreadableImage';

export type ImagePixelsResult =
  { ok: true; pixels: ImagePixels } | { ok: false; error: ImageReadError };

export type PngCanvas = Pick<OffscreenCanvas, 'convertToBlob'> & {
  getContext(type: '2d'): OffscreenCanvasRenderingContext2D | null;
};

function pixelsOf(bitmap: ImageBitmap): ImagePixels | undefined {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext('2d');
  if (!context) return undefined;
  context.drawImage(bitmap, 0, 0);
  return context.getImageData(0, 0, bitmap.width, bitmap.height);
}

/** Decodes with the web view's own PNG and JPG support, in Tauri and in the browser alike. */
export const webViewImageDecoder: ImageDecoder = {
  async decode(image) {
    const bitmap = await createImageBitmap(image);
    return {
      width: bitmap.width,
      height: bitmap.height,
      pixels: () => pixelsOf(bitmap),
      close: () => bitmap.close(),
    };
  },
};

function pixelsWithinLimits(decoded: DecodedImage, limits: ImageSizeLimits): ImagePixelsResult {
  if (!limits.fitsDimensions(decoded.width, decoded.height)) {
    return { ok: false, error: 'imageTooLarge' };
  }
  const pixels = decoded.pixels();
  return pixels ? { ok: true, pixels } : { ok: false, error: 'unreadableImage' };
}

/**
 * RF-12: the pixels of an image the user chose. The file is untrusted, so its size is checked
 * before decoding and its dimensions before reading any pixel; a failure is a result, not a throw.
 */
export async function readImagePixels(
  image: Blob,
  limits: ImageSizeLimits,
  decoder: ImageDecoder = webViewImageDecoder,
): Promise<ImagePixelsResult> {
  if (!limits.fitsBytes(image.size)) return { ok: false, error: 'imageTooLarge' };
  const decoded = await decoder.decode(image).catch(() => undefined);
  if (!decoded) return { ok: false, error: 'unreadableImage' };
  try {
    return pixelsWithinLimits(decoded, limits);
  } catch {
    return { ok: false, error: 'unreadableImage' };
  } finally {
    decoded.close();
  }
}

const offscreenCanvas = (width: number, height: number): PngCanvas =>
  new OffscreenCanvas(width, height);

/** RF-10: a PNG of whatever `draw` paints, e.g. core's report image. */
export async function renderPng(
  width: number,
  height: number,
  draw: (context: OffscreenCanvasRenderingContext2D) => void,
  createCanvas: (width: number, height: number) => PngCanvas = offscreenCanvas,
): Promise<Blob> {
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('This web view cannot draw images');
  draw(context);
  return canvas.convertToBlob({ type: 'image/png' });
}
