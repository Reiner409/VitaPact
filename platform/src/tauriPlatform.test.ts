import { describe, expect, it, vi } from 'vitest';
import type { OpenedFile } from './platform';
import { describePlatformContract, type SavedBytes } from './platformContract';
import { createTauriPlatform, type TauriFileApi } from './tauriPlatform';

const DIRECTORY = 'C:\\Users\\rei\\Downloads\\';

/** Plays the Tauri plugins: the dialog returns a path in DIRECTORY, fs keeps files in a map. */
function fakeTauri() {
  const disk = new Map<string, Uint8Array>();
  let chosen: OpenedFile | undefined;
  const api: TauriFileApi = {
    save: vi.fn((options: { defaultPath: string }) =>
      Promise.resolve(`${DIRECTORY}${options.defaultPath}`),
    ),
    open: vi.fn(() => {
      if (!chosen) return Promise.resolve(null);
      disk.set(`${DIRECTORY}${chosen.name}`, chosen.bytes);
      return Promise.resolve(`${DIRECTORY}${chosen.name}`);
    }),
    readFile: vi.fn((path: string) => Promise.resolve(new Uint8Array(disk.get(path) ?? []))),
    writeFile: vi.fn((path: string, data: Uint8Array) => {
      disk.set(path, data);
      return Promise.resolve();
    }),
  };
  const chooseFile = (file: OpenedFile | undefined) => (chosen = file);
  return { api, disk, chooseFile };
}

describePlatformContract(() => {
  const { api, disk, chooseFile } = fakeTauri();
  return {
    platform: createTauriPlatform(api),
    userChoosesFile: chooseFile,
    savedFiles: () =>
      Promise.resolve(
        [...disk].map(([path, bytes]): SavedBytes => ({
          name: path.slice(DIRECTORY.length),
          bytes,
        })),
      ),
  };
});

describe('F2-03 Tauri platform', () => {
  const filter = { name: 'PNG image', extensions: ['png'] };

  it('offers the suggested name and the translated file type in the save dialog', async () => {
    const { api } = fakeTauri();

    await createTauriPlatform(api).saveFile({ suggestedName: 'r.png', contents: 'x', filter });

    expect(api.save).toHaveBeenCalledWith({ defaultPath: 'r.png', filters: [filter] });
  });

  it('writes nothing when the user cancels the save dialog', async () => {
    const { api } = fakeTauri();
    vi.mocked(api.save).mockResolvedValue(null);

    const outcome = await createTauriPlatform(api).saveFile({
      suggestedName: 'r.png',
      contents: 'x',
      filter,
    });

    expect(outcome).toBe('cancelled');
    expect(api.writeFile).not.toHaveBeenCalled();
  });

  it('RF-12 asks for a single PNG or JPG file, never a folder', async () => {
    const { api } = fakeTauri();

    await createTauriPlatform(api).openImageFile('Images');

    expect(api.open).toHaveBeenCalledWith({
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }],
      multiple: false,
      directory: false,
    });
  });

  it('names the opened file without its folder on Windows and on Unix paths', async () => {
    const { api } = fakeTauri();
    vi.mocked(api.open).mockResolvedValueOnce('/home/rei/luca.png');

    expect((await createTauriPlatform(api).openImageFile('Images'))?.name).toBe('luca.png');
  });
});
