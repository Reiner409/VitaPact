import type { OpenedFile, Platform } from '@vitapact/platform';

/** The part of the platform the data card uses; tests pass a fake one. */
export type DataFiles = Pick<Platform, 'saveFile' | 'openFile'>;

export const BACKUP_EXTENSIONS = ['json'] as const;

/** A day in the name lets several backups sit side by side in one folder. */
export function backupFileName(exportedAt: string): string {
  return `vitapact-backup-${exportedAt.slice(0, 10)}.json`;
}

/** Bytes that are not valid UTF-8 cannot be a file this app wrote. */
export function readBackupText(file: OpenedFile): string | undefined {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(file.bytes);
  } catch {
    return undefined;
  }
}
