import { toBytes } from './fileContents';
import { openImageWith } from './imageFiles';
import type { FileFilter, OpenedFile, Platform } from './platform';

/** `URL.createObjectURL` and `URL.revokeObjectURL`, injectable because jsdom lacks them. */
export interface ObjectUrls {
  createObjectURL(blob: Blob): string;
  revokeObjectURL(url: string): void;
}

const acceptOf = (filter: FileFilter) => filter.extensions.map((ext) => `.${ext}`).join(',');

function pickFile(document: Document, filter: FileFilter): Promise<File | undefined> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = acceptOf(filter);
    input.addEventListener('change', () => resolve(input.files?.[0]), { once: true });
    input.addEventListener('cancel', () => resolve(undefined), { once: true });
    input.click();
  });
}

async function readPickedFile(file: File | undefined): Promise<OpenedFile | undefined> {
  if (!file) return undefined;
  return { name: file.name, bytes: new Uint8Array(await file.arrayBuffer()) };
}

/**
 * Used by the web build (`pnpm web:dev` and the end-to-end tests), where Tauri is absent: a
 * download stands in for the save dialog and a file input for the open dialog.
 */
export function createBrowserPlatform(document: Document, urls: ObjectUrls = URL): Platform {
  const openFile: Platform['openFile'] = async (filter) =>
    readPickedFile(await pickFile(document, filter));

  return {
    saveFile({ suggestedName, contents }) {
      const url = urls.createObjectURL(new Blob([toBytes(contents)]));
      const link = document.createElement('a');
      link.href = url;
      link.download = suggestedName;
      link.click();
      urls.revokeObjectURL(url);
      // A download cannot be cancelled before it starts; the browser asks afterwards, if at all.
      return Promise.resolve('saved');
    },
    openFile,
    openImageFile: (filterName) => openImageWith(openFile, filterName),
  };
}
