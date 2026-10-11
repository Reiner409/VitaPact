import { open, save } from '@tauri-apps/plugin-dialog';
import { readFile, writeFile } from '@tauri-apps/plugin-fs';
import type { TauriFileApi } from './tauriPlatform';

export const tauriFileApi: TauriFileApi = { open, save, readFile, writeFile };
