// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createBrowserPlatform, type ObjectUrls } from './browserPlatform';
import type { OpenedFile } from './platform';
import { describePlatformContract, type SavedBytes } from './platformContract';

/** Plays the browser: object URLs map to blobs, downloads land in a list, the file input picks. */
function fakeBrowser() {
  const blobs = new Map<string, Blob>();
  const downloads: Array<{ name: string; blob: Blob | undefined }> = [];
  const urls: ObjectUrls = {
    createObjectURL: vi.fn((blob: Blob) => {
      const url = `blob:vitapact/${blobs.size}`;
      blobs.set(url, blob);
      return url;
    }),
    revokeObjectURL: vi.fn(),
  };
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    downloads.push({ name: this.download, blob: blobs.get(this.href) });
  });
  const inputs: HTMLInputElement[] = [];
  let chosen: OpenedFile | undefined;
  vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(function (
    this: HTMLInputElement,
  ) {
    inputs.push(this);
    if (!chosen) return void this.dispatchEvent(new Event('cancel'));
    const file = new File([chosen.bytes], chosen.name);
    Object.defineProperty(this, 'files', { value: [file] });
    this.dispatchEvent(new Event('change'));
  });
  const chooseFile = (file: OpenedFile | undefined) => (chosen = file);
  return { urls, downloads, inputs, chooseFile };
}

afterEach(() => vi.restoreAllMocks());

describePlatformContract(() => {
  const { urls, downloads, chooseFile } = fakeBrowser();
  return {
    platform: createBrowserPlatform(document, urls),
    userChoosesFile: chooseFile,
    savedFiles: () =>
      Promise.all(
        downloads.map(async ({ name, blob }): Promise<SavedBytes> => ({
          name,
          bytes: new Uint8Array((await blob?.arrayBuffer()) ?? []),
        })),
      ),
  };
});

describe('F2-03 browser platform', () => {
  it('RF-12 lets the file input accept only PNG and JPG images', async () => {
    const { urls, inputs } = fakeBrowser();

    await createBrowserPlatform(document, urls).openImageFile('Images');

    expect(inputs[0]?.type).toBe('file');
    expect(inputs[0]?.accept).toBe('.png,.jpg,.jpeg');
  });

  it('releases the download link once the file is handed to the browser', async () => {
    const { urls } = fakeBrowser();
    const filter = { name: 'PNG image', extensions: ['png'] };

    await createBrowserPlatform(document, urls).saveFile({
      suggestedName: 'r.png',
      contents: 'x',
      filter,
    });

    expect(urls.revokeObjectURL).toHaveBeenCalledWith('blob:vitapact/0');
  });
});
