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

export type QrReadResult = { ok: true; content: Uint8Array } | { ok: false; error: 'noQrCode' };

/** Medium error correction keeps the code small enough for big modules that survive JPG. */
export function encodeQr(content: Uint8Array): QrModules {
  const { modules } = QRCode.create([{ data: content, mode: 'byte' }], {
    errorCorrectionLevel: 'M',
  });
  return { size: modules.size, isDark: (row, column) => modules.get(row, column) === 1 };
}

/** The report content is binary, so it is taken from the raw bytes, never decoded as text. */
export function readQrCode(pixels: ReportPixels): QrReadResult {
  const found = jsQR(pixels.data, pixels.width, pixels.height);
  return found
    ? { ok: true, content: Uint8Array.from(found.binaryData) }
    : { ok: false, error: 'noQrCode' };
}
