/** A file type offered in the system dialog. `name` is shown to the user, so it arrives translated. */
export interface FileFilter {
  name: string;
  extensions: readonly string[];
}

export interface SaveFileRequest {
  suggestedName: string;
  contents: Uint8Array<ArrayBuffer> | string;
  filter: FileFilter;
}

export type SaveFileOutcome = 'saved' | 'cancelled';

export interface OpenedFile {
  name: string;
  bytes: Uint8Array<ArrayBuffer>;
}

export type ImageMimeType = 'image/png' | 'image/jpeg';

export interface OpenedImage extends OpenedFile {
  mimeType: ImageMimeType;
}

/**
 * Everything the app asks of the operating system. Core never sees it: screens call it and pass
 * the bytes down, so a mobile build only needs another implementation (share sheet, file picker).
 */
export interface Platform {
  saveFile(request: SaveFileRequest): Promise<SaveFileOutcome>;
  /** Resolves to undefined when the user closes the dialog without choosing. */
  openFile(filter: FileFilter): Promise<OpenedFile | undefined>;
  /** Asks for a PNG or JPG image; `filterName` is the translated label of that file type. */
  openImageFile(filterName: string): Promise<OpenedImage | undefined>;
}
