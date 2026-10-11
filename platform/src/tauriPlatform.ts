import { toBytes } from './fileContents';
import { fileNameOf, openImageWith } from './imageFiles';
import type { FileFilter, Platform } from './platform';

interface DialogFilter {
  name: string;
  extensions: string[];
}

/** The slice of the Tauri dialog and fs plugins the platform uses, injectable for tests. */
export interface TauriFileApi {
  save(options: { defaultPath: string; filters: DialogFilter[] }): Promise<string | null>;
  open(options: {
    filters: DialogFilter[];
    multiple: false;
    directory: false;
  }): Promise<string | null>;
  readFile(path: string): Promise<Uint8Array<ArrayBuffer>>;
  writeFile(path: string, data: Uint8Array): Promise<void>;
}

const toDialogFilter = ({ name, extensions }: FileFilter): DialogFilter => ({
  name,
  extensions: [...extensions],
});

export function createTauriPlatform(api: TauriFileApi): Platform {
  const openFile: Platform['openFile'] = async (filter) => {
    const path = await api.open({
      filters: [toDialogFilter(filter)],
      multiple: false,
      directory: false,
    });
    if (path === null) return undefined;
    return { name: fileNameOf(path), bytes: await api.readFile(path) };
  };

  return {
    async saveFile({ suggestedName, contents, filter }) {
      const path = await api.save({
        defaultPath: suggestedName,
        filters: [toDialogFilter(filter)],
      });
      if (path === null) return 'cancelled';
      await api.writeFile(path, toBytes(contents));
      return 'saved';
    },
    openFile,
    openImageFile: (filterName) => openImageWith(openFile, filterName),
  };
}
