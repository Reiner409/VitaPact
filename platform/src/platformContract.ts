import { describe, expect, it } from 'vitest';
import { NotAnImageError } from './imageFiles';
import type { FileFilter, OpenedFile, Platform } from './platform';

export interface SavedBytes {
  name: string;
  bytes: Uint8Array;
}

/** What each implementation's test supplies: the platform and a way to play the user. */
export interface PlatformHarness {
  platform: Platform;
  userChoosesFile(file: OpenedFile | undefined): void;
  savedFiles(): Promise<SavedBytes[]>;
}

const JSON_FILTER: FileFilter = { name: 'VitaPact backup', extensions: ['json'] };
const pngBytes = () => new Uint8Array([0x89, 0x50, 0x4e, 0x47]);

/** Byte arrays from jsdom and from Node are different classes, so compare their contents. */
const withPlainBytes = <T extends { bytes: Uint8Array }>(file: T | undefined) =>
  file && { ...file, bytes: [...file.bytes] };

/** The behaviour every implementation shares, so the screens can rely on any of them. */
export function describePlatformContract(makeHarness: () => PlatformHarness) {
  describe('F2-03 platform contract', () => {
    describeSaving(makeHarness);
    describeOpening(makeHarness);
  });
}

function describeSaving(makeHarness: () => PlatformHarness) {
  describe('saving', () => {
    it('RF-10 saves an image under the suggested name and reports it saved', async () => {
      const { platform, savedFiles } = makeHarness();
      const filter = { name: 'PNG image', extensions: ['png'] };

      const outcome = await platform.saveFile({
        suggestedName: 'report-2026-W41.png',
        contents: pngBytes(),
        filter,
      });

      expect(outcome).toBe('saved');
      expect((await savedFiles()).map(withPlainBytes)).toEqual([
        withPlainBytes({ name: 'report-2026-W41.png', bytes: pngBytes() }),
      ]);
    });

    it('RF-19 saves text as UTF-8 bytes', async () => {
      const { platform, savedFiles } = makeHarness();

      await platform.saveFile({
        suggestedName: 'b.json',
        contents: '{"é":1}',
        filter: JSON_FILTER,
      });

      const [saved] = await savedFiles();
      expect(new TextDecoder().decode(saved?.bytes)).toBe('{"é":1}');
    });
  });
}

function describeOpening(makeHarness: () => PlatformHarness) {
  describe('opening', () => {
    it('RF-19 opens the file the user chooses', async () => {
      const { platform, userChoosesFile } = makeHarness();
      const backup = { name: 'backup.json', bytes: new TextEncoder().encode('{}') };
      userChoosesFile(backup);

      expect(withPlainBytes(await platform.openFile(JSON_FILTER))).toEqual(withPlainBytes(backup));
    });

    it('RF-12 opens a PNG image with its bytes and type', async () => {
      const { platform, userChoosesFile } = makeHarness();
      userChoosesFile({ name: 'luca.png', bytes: pngBytes() });

      expect(withPlainBytes(await platform.openImageFile('Images'))).toEqual({
        name: 'luca.png',
        bytes: [...pngBytes()],
        mimeType: 'image/png',
      });
    });

    it('RF-12 recognises a JPG image whatever the case of its extension', async () => {
      const { platform, userChoosesFile } = makeHarness();
      userChoosesFile({ name: 'WhatsApp Image.JPEG', bytes: new Uint8Array([0xff, 0xd8]) });

      expect((await platform.openImageFile('Images'))?.mimeType).toBe('image/jpeg');
    });

    it('RF-12 rejects a file that is not a PNG or JPG image', async () => {
      const { platform, userChoosesFile } = makeHarness();
      userChoosesFile({ name: 'luca.gif', bytes: new Uint8Array([0x47]) });

      await expect(platform.openImageFile('Images')).rejects.toBeInstanceOf(NotAnImageError);
    });

    it('RF-12 rejects a name whose extension is an object key such as .constructor', async () => {
      const { platform, userChoosesFile } = makeHarness();
      userChoosesFile({ name: 'luca.constructor', bytes: new Uint8Array([0x47]) });

      await expect(platform.openImageFile('Images')).rejects.toBeInstanceOf(NotAnImageError);
    });

    it('RF-12 resolves to nothing when the user closes the dialog', async () => {
      const { platform, userChoosesFile } = makeHarness();
      userChoosesFile(undefined);

      expect(await platform.openImageFile('Images')).toBeUndefined();
    });
  });
}
