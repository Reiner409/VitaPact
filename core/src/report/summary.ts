import type { CalendarDate, IsoWeek } from '../calendar';

export const REPORT_VERSION = 1;

/** Measured in code points, so emoji count once; also the onboarding limit (F3-ON-01). */
export const NICKNAME_MAX_LENGTH = 24;

/** RF-27: a hard week below this score followed by at least the gain below is a comeback. */
const COMEBACK_BELOW = 50;
const COMEBACK_GAIN = 15;

/** The weekly summary carried by the QR code, field names as in requirements section 9. */
export interface ReportSummary {
  v: typeof REPORT_VERSION;
  uid: string;
  nick: string;
  generatedOn: CalendarDate;
  week: IsoWeek;
  from: CalendarDate;
  to: CalendarDate;
  logged: number;
  sleepAvg: number;
  sleepOk: number;
  trainDone: number;
  trainGoal: number;
  trainMin: number;
  cleanOk: number;
  sunOk: number;
  /** Left out when the user hides their weight (D11) or skipped the weigh-in. */
  weight?: number;
  delta?: number;
  score: number;
  prevScore?: number;
  comeback: boolean;
  pub: string;
  sig: string;
}

/** Everything the author signs: the summary without the signature itself. */
export type SignedContent = Omit<ReportSummary, 'sig'>;

export function isComeback(score: number, prevScore: number | undefined): boolean {
  return (
    prevScore !== undefined && prevScore < COMEBACK_BELOW && score - prevScore >= COMEBACK_GAIN
  );
}

export function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}
