import { describe, expect, it } from 'vitest';
import {
  REPORT_IMAGE_HEIGHT,
  REPORT_IMAGE_WIDTH,
  drawReportImage,
  layoutReportImage,
  imageSizeLimits,
  readQrCode,
} from '.';
import { pixelCanvas, renderReportPixels, sampleReportCard, sampleReportTheme } from './testing';

const card = sampleReportCard;
const theme = sampleReportTheme;
const reportContent = card.content;

describe('RF-10 report image with its QR code', () => {
  it('RF-10 draws a 1080 × 1350 portrait image', () => {
    const pixels = renderReportPixels(card);

    expect([pixels.width, pixels.height]).toEqual([1080, 1350]);
  });

  it('RF-10 reads back exactly the content it drew', () => {
    const result = readQrCode(renderReportPixels(card));

    expect(result).toEqual({ ok: true, content: reportContent });
  });

  it('RF-12 gives a clear error for an image without a QR code', () => {
    const blank = pixelCanvas(REPORT_IMAGE_WIDTH, REPORT_IMAGE_HEIGHT);
    blank.context.fillStyle = theme.colors.background;
    blank.context.fillRect(0, 0, REPORT_IMAGE_WIDTH, REPORT_IMAGE_HEIGHT);

    expect(readQrCode(blank.pixels)).toEqual({ ok: false, error: 'noQrCode' });
  });

  it('RF-10 writes each text centred, in the theme font, squeezed to its maximum width', () => {
    const calls: unknown[][] = [];
    const recorder = {
      ...pixelCanvas(1, 1).context,
      fillRect: () => {},
      fillText(...args: unknown[]) {
        calls.push([this.font, this.fillStyle, this.textAlign, ...args]);
      },
    };

    drawReportImage(recorder, layoutReportImage(card), theme);

    expect(calls[0]).toEqual([
      'bold 64px Inter, sans-serif',
      '#1F2A24',
      'center',
      'Rei',
      540,
      120,
      936,
    ]);
    expect(calls).toHaveLength(
      layoutReportImage(card).filter((item) => item.kind === 'text').length,
    );
  });

  it('RF-12 reports pixel data that does not match the image size as unreadable', () => {
    const pixels = { width: 10, height: 10, data: new Uint8ClampedArray(12) };

    expect(readQrCode(pixels)).toEqual({ ok: false, error: 'unreadableImage' });
  });

  it('RF-10 refuses content too large for a readable QR code', () => {
    const tooLarge = { ...card, content: new Uint8Array(2000) };

    expect(() => layoutReportImage(tooLarge)).toThrow(RangeError);
  });
});

describe('RF-11 who the report belongs to, in plain text', () => {
  const layout = layoutReportImage(card);
  const qr = layout.find((item) => item.kind === 'qr');
  const textsBelowQr = layout
    .filter((item) => item.kind === 'text' && qr !== undefined && item.y > qr.y + qr.extent)
    .map((item) => (item.kind === 'text' ? item.text : ''));

  it('RF-11 prints the nickname, the UUID and the period under the QR code', () => {
    expect(textsBelowQr.join(' ')).toContain('Rei');
    expect(textsBelowQr).toContain('3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90');
    expect(textsBelowQr.join(' ')).toContain('5-11 Oct 2026');
  });

  it('D23 ends the image with the motto', () => {
    expect(textsBelowQr.at(-1)).toBe('Join the VitalityMaxxing lifestyle');
  });

  it('RF-11 keeps every text inside the image, however long the nickname', () => {
    const texts = layoutReportImage({ ...card, nickname: 'W'.repeat(24) }).filter(
      (item) => item.kind === 'text',
    );

    for (const text of texts) {
      expect(text.x - text.maxWidth / 2).toBeGreaterThanOrEqual(0);
      expect(text.x + text.maxWidth / 2).toBeLessThanOrEqual(REPORT_IMAGE_WIDTH);
    }
  });

  it('RF-10 RF-11 keeps the layout of the report image', () => {
    const withoutModules = layout.map((item) =>
      item.kind === 'qr' ? { ...item, modules: `${item.modules.size} modules` } : item,
    );

    expect(withoutModules).toMatchSnapshot();
  });
});

describe('RF-12 limits on an untrusted image', () => {
  it('RF-12 accepts a photo-sized image file up to 20 MB', () => {
    expect(imageSizeLimits.fitsBytes(20 * 1024 * 1024)).toBe(true);
    expect(imageSizeLimits.fitsBytes(20 * 1024 * 1024 + 1)).toBe(false);
  });

  it('RF-12 accepts up to 8192 pixels per side and 40 megapixels in all', () => {
    expect(imageSizeLimits.fitsDimensions(1080, 1350)).toBe(true);
    expect(imageSizeLimits.fitsDimensions(8192, 4096)).toBe(true);
    expect(imageSizeLimits.fitsDimensions(8193, 100)).toBe(false);
    expect(imageSizeLimits.fitsDimensions(100, 8193)).toBe(false);
    expect(imageSizeLimits.fitsDimensions(8000, 6000)).toBe(false);
  });

  it('RF-12 refuses an image with no pixels', () => {
    expect(imageSizeLimits.fitsDimensions(0, 1350)).toBe(false);
  });
});
