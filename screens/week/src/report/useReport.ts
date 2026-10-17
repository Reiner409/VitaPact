import type { CalendarDate } from '@vitapact/core/calendar';
import type { Profile, VitaPactDatabase } from '@vitapact/core/storage';
import { useTranslation } from '@vitapact/i18n';
import type { SaveFileRequest, SaveFileOutcome } from '@vitapact/platform';
import { useEffect, useState } from 'react';
import type { WeekData } from '../week/useWeekData';
import { reportCardOf } from './reportCard';
import { reportInputOf } from './reportInput';
import { reportPng, signedReport, signingKeysOf } from './makeReport';

export type SaveFile = (request: SaveFileRequest) => Promise<SaveFileOutcome>;

export type ReportState =
  | { status: 'closed' }
  | { status: 'making' }
  | { status: 'failed' }
  | { status: 'ready'; png: Blob; previewUrl: string; saved: boolean };

export interface ReportContext {
  db: VitaPactDatabase;
  profile: Profile;
  data: WeekData;
  today: CalendarDate;
}

async function makePng(
  context: ReportContext,
  t: ReturnType<typeof useTranslation>['t'],
  language: string,
) {
  const input = reportInputOf(context.profile, context.data, context.today);
  const keys = await signingKeysOf(context.db, context.profile);
  const content = await signedReport(input, keys);
  return reportPng(reportCardOf(t, language, input, content));
}

/** F3-WK-06: makes the signed report image on request and saves it where the user chooses. */
export function useReport(context: ReportContext | undefined, saveFile: SaveFile) {
  const { t, i18n } = useTranslation('week');
  const [state, setState] = useState<ReportState>({ status: 'closed' });
  const previewUrl = state.status === 'ready' ? state.previewUrl : undefined;

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const open = async () => {
    if (!context) return;
    setState({ status: 'making' });
    try {
      const png = await makePng(context, t, i18n.language);
      setState({ status: 'ready', png, previewUrl: URL.createObjectURL(png), saved: false });
    } catch {
      setState({ status: 'failed' });
    }
  };

  const save = async () => {
    if (state.status !== 'ready' || !context) return;
    const outcome = await saveFile({
      suggestedName: t('report.fileName', { week: context.data.summary.week }),
      contents: new Uint8Array(await state.png.arrayBuffer()),
      filter: { name: t('report.fileType'), extensions: ['png'] },
    });
    if (outcome === 'saved') setState({ ...state, saved: true });
  };

  return { state, open, save, close: () => setState({ status: 'closed' }) };
}
