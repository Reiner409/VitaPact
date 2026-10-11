import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';
import { describe, expect, it } from 'vitest';
import {
  REPORT_IMAGE_HEIGHT,
  REPORT_IMAGE_WIDTH,
  drawReportImage,
  layoutReportImage,
  readQrCode,
  type ReportCard,
  type ReportImageTheme,
  type ReportPixels,
} from '.';
import { pixelCanvas } from './testing/pixelCanvas';

/** Every byte value, as long as the largest report (F2-10), so nothing depends on text. */
const reportContent = Uint8Array.from({ length: 398 }, (_, index) => (index * 37) % 256);

const card: ReportCard = {
  content: reportContent,
  nickname: 'Rei',
  userId: '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90',
  weekLabel: 'Week 41 · 2026',
  periodLabel: '5-11 Oct 2026',
  scoreLabel: '62',
  verdictLabel: 'Solid base',
  indicators: [
    { pillar: 'sleep', label: 'Sleep', value: '7.0 h · 4/7' },
    { pillar: 'training', label: 'Training', value: '2/3 · 110 min' },
    { pillar: 'food', label: 'Clean eating', value: '4/7' },
    { pillar: 'sun', label: 'Sun', value: '3/7' },
  ],
  weightLabel: '78.4 kg (-0.6)',
  motto: 'Join the VitalityMaxxing lifestyle',
};

const theme: ReportImageTheme = {
  fontFamily: 'Inter, sans-serif',
  colors: {
    background: '#F6F1E7',
    text: '#1F2A24',
    textMuted: '#5B665F',
    primary: '#2F6B4F',
    sleep: '#5B6CC2',
    training: '#C2703D',
    food: '#4E9A5B',
    sun: '#D9A21B',
    qrDark: '#000000',
    qrLight: '#FFFFFF',
  },
};

function renderPixels(reportCard: ReportCard): ReportPixels {
  const canvas = pixelCanvas(REPORT_IMAGE_WIDTH, REPORT_IMAGE_HEIGHT);
  drawReportImage(canvas.context, layoutReportImage(reportCard), theme);
  return canvas.pixels;
}

function throughPng(pixels: ReportPixels): ReportPixels {
  const png = new PNG({ width: pixels.width, height: pixels.height });
  png.data.set(pixels.data);
  const decoded = PNG.sync.read(PNG.sync.write(png));
  return {
    width: decoded.width,
    height: decoded.height,
    data: new Uint8ClampedArray(decoded.data),
  };
}

function throughJpeg(pixels: ReportPixels, quality: number): ReportPixels {
  const encoded = jpeg.encode({ ...pixels, data: Buffer.from(pixels.data) }, quality);
  const decoded = jpeg.decode(encoded.data, { useTArray: true });
  return {
    width: decoded.width,
    height: decoded.height,
    data: new Uint8ClampedArray(decoded.data),
  };
}

describe('RF-10 report image with its QR code', () => {
  it('RF-10 draws a 1080 × 1350 portrait image', () => {
    const pixels = renderPixels(card);

    expect([pixels.width, pixels.height]).toEqual([1080, 1350]);
  });

  it('RF-10 reads back exactly the content it drew, through a PNG file', () => {
    const result = readQrCode(throughPng(renderPixels(card)));

    expect(result).toEqual({ ok: true, content: reportContent });
  });

  it('RF-12 still reads the content after a chat app recompresses it as a medium-quality JPG', () => {
    const result = readQrCode(throughJpeg(renderPixels(card), 50));

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
