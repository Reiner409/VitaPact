import { describe, expect, it, vi } from 'vitest';
import { createCopyImage } from './clipboard';

class FakeItem {
  constructor(readonly items: Record<string, Blob>) {}
}
const Item = FakeItem as unknown as new (items: Record<string, Blob>) => ClipboardItem;
const png = new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], { type: 'image/png' });

describe('F3-WK-06 RF-10 copy the report image', () => {
  it('writes the PNG to the clipboard as one image item', async () => {
    const write = vi.fn(() => Promise.resolve());
    expect(await createCopyImage({ write }, Item)(png)).toBe('copied');
    expect(write).toHaveBeenCalledWith([new FakeItem({ 'image/png': png })]);
  });

  it('reports a failure when the clipboard refuses', async () => {
    const write = vi.fn(() => Promise.reject(new Error('NotAllowedError')));
    expect(await createCopyImage({ write }, Item)(png)).toBe('failed');
  });

  it('reports a failure when there is no clipboard', async () => {
    expect(await createCopyImage(undefined, Item)(png)).toBe('failed');
    expect(await createCopyImage({ write: vi.fn() }, undefined)(png)).toBe('failed');
  });
});
