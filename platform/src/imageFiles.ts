import type { FileFilter, ImageMimeType, OpenedFile, OpenedImage } from './platform';

export const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg'];

/** The first bytes of every PNG and JPG file. */
const SIGNATURES: readonly { mimeType: ImageMimeType; bytes: readonly number[] }[] = [
  { mimeType: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mimeType: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
];

const startsWith = (bytes: Uint8Array, prefix: readonly number[]) =>
  prefix.every((byte, index) => bytes[index] === byte);

export function imageFilter(filterName: string): FileFilter {
  return { name: filterName, extensions: IMAGE_EXTENSIONS };
}

export function fileNameOf(path: string): string {
  return path.split(/[\\/]/).at(-1) ?? path;
}

/**
 * The type comes from the file's own bytes, not its name: Android hands over a `content://` link
 * without an extension, and a typed name can bypass the dialog's filter anyway.
 */
export function asImage(file: OpenedFile): OpenedImage {
  const signature = SIGNATURES.find(({ bytes }) => startsWith(file.bytes, bytes));
  if (!signature) throw new NotAnImageError(file.name);
  return { ...file, mimeType: signature.mimeType };
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
