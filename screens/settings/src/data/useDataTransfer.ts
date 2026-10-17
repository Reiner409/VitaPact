import { exportData, importData, type VitaPactDatabase } from '@vitapact/core/storage';
import type { FileFilter } from '@vitapact/platform';
import { useState } from 'react';
import { BACKUP_EXTENSIONS, backupFileName, readBackupText, type DataFiles } from './dataFiles';

export type DataNotice =
  | 'exported'
  | 'exportFailed'
  | 'imported'
  | 'importDamaged'
  | 'importUnknownVersion'
  | 'importFailed';

/** Which confirmation is open: overwrite (RF-19), then another user's file (D38). */
export type ImportStep = { step: 'overwrite' | 'otherUser'; text: string } | undefined;

export interface DataTransferOptions {
  db: VitaPactDatabase;
  files: DataFiles;
  fileTypeName: string;
  now: () => Date;
  onImported: () => Promise<void>;
}

const FAILED_IMPORT: Record<'damaged' | 'unknownVersion', DataNotice> = {
  damaged: 'importDamaged',
  unknownVersion: 'importUnknownVersion',
};

export function useDataTransfer(options: DataTransferOptions) {
  const [notice, setNotice] = useState<DataNotice>();
  const [pending, setPending] = useState<ImportStep>();
  const [busy, setBusy] = useState(false);
  const filter: FileFilter = { name: options.fileTypeName, extensions: BACKUP_EXTENSIONS };

  const run = async (action: () => Promise<DataNotice | undefined>, failure: DataNotice) => {
    setBusy(true);
    const result = await action().catch(() => failure);
    setBusy(false);
    if (result) setNotice(result);
  };

  const exportAll = () => run(() => exportTo(options, filter), 'exportFailed');

  const chooseImport = () =>
    run(async () => {
      const opened = await options.files.openFile(filter);
      if (!opened) return undefined;
      const text = readBackupText(opened);
      if (text === undefined) return 'importDamaged';
      setPending({ step: 'overwrite', text });
      return undefined;
    }, 'importFailed');

  const confirmImport = (current: NonNullable<ImportStep>) => {
    setPending(undefined);
    return run(() => importFrom(options, current, setPending), 'importFailed');
  };

  return {
    notice,
    pending,
    busy,
    exportAll,
    chooseImport,
    confirmImport,
    cancelImport: () => setPending(undefined),
    closeNotice: () => setNotice(undefined),
  };
}

async function exportTo(
  { db, files, now }: DataTransferOptions,
  filter: FileFilter,
): Promise<DataNotice | undefined> {
  const exportedAt = now().toISOString();
  const contents = await exportData(db, exportedAt);
  const saved = await files.saveFile({
    suggestedName: backupFileName(exportedAt),
    contents,
    filter,
  });
  return saved === 'saved' ? 'exported' : undefined;
}

async function importFrom(
  { db, onImported }: DataTransferOptions,
  { step, text }: NonNullable<ImportStep>,
  askOtherUser: (next: ImportStep) => void,
): Promise<DataNotice | undefined> {
  const outcome = await importData(db, text, { allowOtherUser: step === 'otherUser' });
  if (outcome.ok) {
    await onImported().catch(() => undefined);
    return 'imported';
  }
  if (outcome.reason === 'otherUser') {
    askOtherUser({ step: 'otherUser', text });
    return undefined;
  }
  return FAILED_IMPORT[outcome.reason];
}
