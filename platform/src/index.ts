import { isTauri } from '@tauri-apps/api/core';
import { createBrowserPlatform } from './browserPlatform';
import type { Platform } from './platform';
import { tauriFileApi } from './tauriFileApi';
import { createTauriPlatform } from './tauriPlatform';

export type {
  FileFilter,
  ImageMimeType,
  OpenedFile,
  OpenedImage,
  Platform,
  SaveFileOutcome,
  SaveFileRequest,
} from './platform';
export { NotAnImageError } from './imageFiles';
export {
  readImagePixels,
  renderPng,
  type ImagePixels,
  type ImagePixelsResult,
  type ImageReadError,
  type ImageSizeLimits,
} from './images';

let current: Platform | undefined;

/** The platform the app runs on: Tauri in the desktop window, the browser in the web build. */
export function getPlatform(): Platform {
  current ??= isTauri() ? createTauriPlatform(tauriFileApi) : createBrowserPlatform(document);
  return current;
}
