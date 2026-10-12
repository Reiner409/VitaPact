import type { ReportDrawingContext, ReportPixels } from '../image';

const CHANNELS = 4;
const OPAQUE = 255;

type Rgb = readonly number[];

function parseHexColor(color: string): Rgb {
  const hex = /^#([0-9a-f]{6})$/i.exec(color)?.[1];
  if (!hex) throw new Error(`The test canvas only paints #rrggbb colours, got ${color}`);
  return [0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
}

function paint(pixels: ReportPixels, x: number, y: number, color: Rgb) {
  pixels.data.set([...color, OPAQUE], (y * pixels.width + x) * CHANNELS);
}

function fillArea(pixels: ReportPixels, area: DOMRectInit, color: Rgb) {
  const { x = 0, y = 0, width = 0, height = 0 } = area;
  for (let row = Math.max(0, y); row < Math.min(pixels.height, y + height); row += 1) {
    for (let column = Math.max(0, x); column < Math.min(pixels.width, x + width); column += 1) {
      paint(pixels, column, row, color);
    }
  }
}

/**
 * A canvas for Node tests: it paints rectangles into real pixels and skips text, which is enough
 * to check that the QR code survives encoding and compression.
 */
export function pixelCanvas(width: number, height: number) {
  const pixels: ReportPixels = {
    width,
    height,
    data: new Uint8ClampedArray(width * height * CHANNELS).fill(OPAQUE),
  };
  const context: ReportDrawingContext = {
    fillStyle: '#000000',
    font: '',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    fillRect(x, y, rectWidth, rectHeight) {
      fillArea(
        pixels,
        { x, y, width: rectWidth, height: rectHeight },
        parseHexColor(String(this.fillStyle)),
      );
    },
    fillText() {},
  };
  return { context, pixels };
}
