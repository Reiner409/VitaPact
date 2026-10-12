import jsQR from 'jsqr';
import QRCode from 'qrcode';

/** Pixels in RGBA order, as `ImageData` holds them. */
export interface ReportPixels {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8ClampedArray;
}

export interface QrModules {
  /** Modules per side, without the quiet zone. */
  readonly size: number;
  isDark(row: number, column: number): boolean;
}

const RGBA_CHANNELS = 4;

/** `imageTooLarge` comes from the size check the platform runs before decoding. */
export type QrReadError = 'noQrCode' | 'imageTooLarge' | 'unreadableImage';

export type QrReadResult = { ok: true; content: Uint8Array } | { ok: false; error: QrReadError };

/** Medium error correction keeps the code small enough for big modules that survive JPG. */
export function encodeQr(content: Uint8Array): QrModules {
  const { modules } = QRCode.create([{ data: content, mode: 'byte' }], {
    errorCorrectionLevel: 'M',
  });
  return { size: modules.size, isDark: (row, column) => modules.get(row, column) === 1 };
}

/**
 * The bytes of any QR code found, taken raw because a report is binary; `readReport` then decides
 * whether they are a VPACT1 report. The report is dark on light, so inverted codes are not tried.
 */
export function readQrCode(pixels: ReportPixels): QrReadResult {
  if (pixels.data.length !== pixels.width * pixels.height * RGBA_CHANNELS) {
    return { ok: false, error: 'unreadableImage' };
  }
  const found = jsQR(pixels.data, pixels.width, pixels.height, { inversionAttempts: 'dontInvert' });
  return found
    ? { ok: true, content: Uint8Array.from(found.binaryData) }
    : { ok: false, error: 'noQrCode' };
}

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_IMAGE_SIDE = 8192;
const MAX_IMAGE_PIXELS = 40_000_000;

/** RF-12: caps for an image the user picks, generous for phone photos, safe for memory. */
export const imageSizeLimits = {
  fitsBytes: (bytes: number): boolean => bytes <= MAX_IMAGE_BYTES,
  fitsDimensions: (width: number, height: number): boolean =>
    width > 0 &&
    height > 0 &&
    width <= MAX_IMAGE_SIDE &&
    height <= MAX_IMAGE_SIDE &&
    width * height <= MAX_IMAGE_PIXELS,
};
