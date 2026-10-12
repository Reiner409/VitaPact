import { readQrCode } from '@vitapact/core/report';
import {
  renderReportPixels,
  sampleReportCard,
  sampleReportContent,
} from '@vitapact/core/report/testing';
import { expect, test } from './fixtures';

interface RgbaImage {
  width: number;
  height: number;
  base64: string;
}

/** Runs in Chromium, the engine of WebView2, so the JPG codec is the one the app really uses. */
async function recompressAsJpeg({ image, quality }: { image: RgbaImage; quality: number }) {
  const fromBase64 = (text: string) => Uint8Array.from(atob(text), (char) => char.charCodeAt(0));
  const toBase64 = (bytes: Uint8ClampedArray) => {
    let binary = '';
    for (let start = 0; start < bytes.length; start += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(start, start + 0x8000));
    }
    return btoa(binary);
  };
  const { width, height } = image;
  const source = new OffscreenCanvas(width, height);
  const pixels = new ImageData(new Uint8ClampedArray(fromBase64(image.base64)), width, height);
  source.getContext('2d')?.putImageData(pixels, 0, 0);
  const jpeg = await source.convertToBlob({ type: 'image/jpeg', quality });
  const bitmap = await createImageBitmap(jpeg);
  const target = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = target.getContext('2d');
  if (!context) throw new Error('No 2D context');
  context.drawImage(bitmap, 0, 0);
  const decoded = context.getImageData(0, 0, bitmap.width, bitmap.height);
  return {
    type: jpeg.type,
    width: decoded.width,
    height: decoded.height,
    base64: toBase64(decoded.data),
  };
}

test.describe('RF-12 a report image shared through a chat app', () => {
  test('RF-12 still reads after the web view recompresses it as a medium-quality JPG', async ({
    page,
  }) => {
    const drawn = renderReportPixels(sampleReportCard);
    const image: RgbaImage = {
      width: drawn.width,
      height: drawn.height,
      base64: Buffer.from(drawn.data).toString('base64'),
    };

    const jpeg = await page.evaluate(recompressAsJpeg, { image, quality: 0.5 });
    const pixels = {
      width: jpeg.width,
      height: jpeg.height,
      data: new Uint8ClampedArray(Buffer.from(jpeg.base64, 'base64')),
    };

    expect(jpeg.type).toBe('image/jpeg');
    expect(readQrCode(pixels)).toEqual({ ok: true, content: sampleReportContent });
  });
});
