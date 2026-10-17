import type { ImportOutcome, ReportSummary } from '@vitapact/core/report';
import type { VitaPactDatabase } from '@vitapact/core/storage';
import { useState } from 'react';
import type { PickError, PickReport, PickedReport, ReadReportImage } from './pickReport';
import { checkReport, saveReport } from './reportStore';

export type AddReportProblem = PickError | Extract<ImportOutcome, { kind: 'rejected' }>['reason'];

export type AddReportState =
  | { kind: 'closed' }
  | { kind: 'reading' }
  | { kind: 'rejected'; reason: AddReportProblem }
  | { kind: 'ready'; outcome: 'newFriend' | 'update' | 'replaceWeek'; summary: ReportSummary }
  | { kind: 'saveFailed'; outcome: 'newFriend' | 'update' | 'replaceWeek'; summary: ReportSummary };

interface AddReportOptions {
  db: VitaPactDatabase;
  ownUserId: string;
  pickReport: PickReport;
  readImage: ReadReportImage;
  filterName: string;
  now: () => Date;
  /** Called with the friend's nickname once the report is saved. */
  onSaved: (nickname: string) => Promise<void>;
}

async function check(options: AddReportOptions, picked: PickedReport): Promise<AddReportState> {
  if (picked.kind === 'cancelled') return { kind: 'closed' };
  if (picked.kind === 'failed') return { kind: 'rejected', reason: picked.reason };
  const outcome = await checkReport(options.db, options.ownUserId, picked.content);
  if (outcome.kind === 'rejected') return { kind: 'rejected', reason: outcome.reason };
  return { kind: 'ready', outcome: outcome.kind, summary: outcome.summary };
}

/** RF-12: choose the image, see whose report it is, then confirm (F3-FR-03, F3-FR-04). */
export function useAddReport(options: AddReportOptions) {
  const [state, setState] = useState<AddReportState>({ kind: 'closed' });

  async function readWith(pick: () => Promise<PickedReport>) {
    setState({ kind: 'reading' });
    setState(await check(options, await pick()));
  }

  /** The "Add report" button: the user chooses the image file. */
  const open = () => readWith(() => options.pickReport(options.filterName));

  /** Ctrl+V anywhere on the screen with an image copied from a chat. */
  const openPasted = (image: Blob | 'notAnImage') =>
    readWith(async () =>
      image === 'notAnImage' ? { kind: 'failed', reason: 'notAnImage' } : options.readImage(image),
    );

  async function confirm(groupIds: readonly string[]) {
    if (state.kind !== 'ready' && state.kind !== 'saveFailed') return;
    try {
      await saveReport(options.db, state.summary, groupIds, options.now());
      setState({ kind: 'closed' });
      await options.onSaved(state.summary.nick);
    } catch {
      setState({ ...state, kind: 'saveFailed' });
    }
  }

  return { state, open, openPasted, confirm, close: () => setState({ kind: 'closed' }) };
}
