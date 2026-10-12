import { describe, expect, it } from 'vitest';
import {
  readImagePixels,
  renderPng,
  type DecodedImage,
  type ImageDecoder,
  type ImageSizeLimits,
  type PngCanvas,
} from './images';

const limits: ImageSizeLimits = {
  fitsBytes: (bytes) => bytes <= 100,
  fitsDimensions: (width, height) => width <= 50 && height <= 50,
};

function fakeDecoder(width: number, height: number, readable = true) {
  const closed: boolean[] = [];
  const decoder: ImageDecoder = {
    decode(): Promise<DecodedImage> {
      closed.push(false);
      return Promise.resolve({
        width,
        height,
        pixels: () =>
          readable ? { width, height, data: new Uint8ClampedArray(width * height * 4) } : undefined,
        close: () => (closed[closed.length - 1] = true),
      });
    },
  };
  return { decoder, closed };
}

const image = (bytes: number) => new Blob([new Uint8Array(bytes)], { type: 'image/png' });

describe('RF-12 reading the pixels of a chosen image', () => {
  it('RF-12 returns the pixels of an image within the limits and frees the bitmap', async () => {
    const { decoder, closed } = fakeDecoder(40, 30);

    const result = await readImagePixels(image(80), limits, decoder);

    expect(result).toMatchObject({ ok: true, pixels: { width: 40, height: 30 } });
    expect(closed).toEqual([true]);
  });

  it('RF-12 refuses a file too large before decoding it', async () => {
    const { decoder, closed } = fakeDecoder(40, 30);

    const result = await readImagePixels(image(101), limits, decoder);

    expect(result).toEqual({ ok: false, error: 'imageTooLarge' });
    expect(closed).toEqual([]);
  });

  it('RF-12 refuses an image with too many pixels and frees the bitmap', async () => {
    const { decoder, closed } = fakeDecoder(51, 30);

    const result = await readImagePixels(image(80), limits, decoder);

    expect(result).toEqual({ ok: false, error: 'imageTooLarge' });
    expect(closed).toEqual([true]);
  });

  it('RF-12 reports a file the web view cannot decode as unreadable', async () => {
    const failing: ImageDecoder = { decode: () => Promise.reject(new Error('corrupt')) };

    await expect(readImagePixels(image(80), limits, failing)).resolves.toEqual({
      ok: false,
      error: 'unreadableImage',
    });
  });

  it('RF-12 reports an image whose pixels cannot be read as unreadable', async () => {
    const { decoder, closed } = fakeDecoder(40, 30, false);

    const result = await readImagePixels(image(80), limits, decoder);

    expect(result).toEqual({ ok: false, error: 'unreadableImage' });
    expect(closed).toEqual([true]);
  });
});

describe('RF-10 saving a drawn image as PNG', () => {
  it('RF-10 draws on a canvas of the requested size and exports it as PNG', async () => {
    const created: Array<[number, number]> = [];
    const drawn: unknown[] = [];
    const canvas = (width: number, height: number): PngCanvas => {
      created.push([width, height]);
      const context = { marker: 'context' } as unknown as OffscreenCanvasRenderingContext2D;
      return {
        getContext: () => context,
        convertToBlob: (options) => Promise.resolve(new Blob([], { type: options?.type ?? '' })),
      };
    };

    const png = await renderPng(1080, 1350, (context) => drawn.push(context), canvas);

    expect(created).toEqual([[1080, 1350]]);
    expect(drawn).toEqual([{ marker: 'context' }]);
    expect(png.type).toBe('image/png');
  });

  it('RF-10 fails clearly when the web view cannot draw', async () => {
    const canvas = (): PngCanvas => ({
      getContext: () => null,
      convertToBlob: () => Promise.reject(new Error('unused')),
    });

    await expect(renderPng(10, 10, () => {}, canvas)).rejects.toThrow('cannot draw');
  });
});
