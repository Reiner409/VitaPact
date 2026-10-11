import type { FileFilter, ImageMimeType, OpenedFile, OpenedImage } from './platform';

const MIME_TYPE_BY_EXTENSION: ReadonlyMap<string, ImageMimeType> = new Map([
  ['png', 'image/png'],
  ['jpg', 'image/jpeg'],
  ['jpeg', 'image/jpeg'],
]);

export const IMAGE_EXTENSIONS = [...MIME_TYPE_BY_EXTENSION.keys()];

export function imageFilter(filterName: string): FileFilter {
  return { name: filterName, extensions: IMAGE_EXTENSIONS };
}

export function fileNameOf(path: string): string {
  return path.split(/[\\/]/).at(-1) ?? path;
}

/** The dialog only offers images, but a typed name can still bypass the filter, hence the check. */
export function asImage(file: OpenedFile): OpenedImage {
  const extension = file.name.split('.').at(-1)?.toLowerCase() ?? '';
  const mimeType = MIME_TYPE_BY_EXTENSION.get(extension);
  if (!mimeType) throw new NotAnImageError(file.name);
  return { ...file, mimeType };
}

export class NotAnImageError extends Error {
  constructor(readonly fileName: string) {
    super(`${fileName} is not a PNG or JPG image`);
    this.name = 'NotAnImageError';
  }
}

export async function openImageWith(
  openFile: (filter: FileFilter) => Promise<OpenedFile | undefined>,
  filterName: string,
): Promise<OpenedImage | undefined> {
  const file = await openFile(imageFilter(filterName));
  return file && asImage(file);
}
