import { openImageWith } from './imageFiles';
import type { OpenedFile, Platform, SaveFileRequest } from './platform';

/**
 * A platform for tests: it records saved files and hands out the files queued with
 * `chooseNextFile`, so screen tests can drive save and open flows without Tauri or a browser.
 */
export interface MemoryPlatform extends Platform {
  readonly savedFiles: readonly SaveFileRequest[];
  /** Queues the file the next open dialog returns; undefined plays a user who cancels. */
  chooseNextFile(file: OpenedFile | undefined): void;
  cancelNextSave(): void;
}

export function createMemoryPlatform(): MemoryPlatform {
  const savedFiles: SaveFileRequest[] = [];
  const filesToOpen: Array<OpenedFile | undefined> = [];
  let cancelSave = false;

  const openFile: Platform['openFile'] = () => Promise.resolve(filesToOpen.shift());

  return {
    savedFiles,
    chooseNextFile: (file) => void filesToOpen.push(file),
    cancelNextSave: () => void (cancelSave = true),
    saveFile(request) {
      if (cancelSave) {
        cancelSave = false;
        return Promise.resolve('cancelled');
      }
      savedFiles.push(request);
      return Promise.resolve('saved');
    },
    openFile,
    openImageFile: (filterName) => openImageWith(openFile, filterName),
  };
}
