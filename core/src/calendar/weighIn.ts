import { daysBetween, isSunday, type CalendarDate } from './calendarDate';
import { isoWeekOf, previousWeek, sundayOf, weighInCatchUpDeadline, type IsoWeek } from './isoWeek';

/** The state of the weigh-in that is due on a given day (RF-05, RF-06, RF-07). */
export type WeighInStatus = 'toAsk' | 'postponed' | 'catchUp' | 'done' | 'expired';

export interface WeighInContext {
  today: CalendarDate;
  /** A weigh-in is already saved for `weighInWeekFor(today)`. */
  recorded: boolean;
  /** The user chose "Later" on the Sunday dialog. */
  postponed: boolean;
}

/** Saved in the `weighIns` table; there is no late mark because a catch-up is never late (D9). */
export interface WeighIn {
  week: IsoWeek;
  weightKg: number;
  measuredOn: CalendarDate;
  fastingConfirmed: true;
}

export type WeighInError = 'expired' | 'fastingNotConfirmed' | 'invalidWeight';

export type WeighInResult = { ok: true; weighIn: WeighIn } | { ok: false; error: WeighInError };

/** Sunday asks for its own week; the days after it can only concern the week just closed. */
export function weighInWeekFor(today: CalendarDate): IsoWeek {
  const currentWeek = isoWeekOf(today);
  return isSunday(today) ? currentWeek : previousWeek(currentWeek);
}

function canStillBeSaved(today: CalendarDate): boolean {
  return daysBetween(today, weighInCatchUpDeadline(weighInWeekFor(today))) >= 0;
}

export function weighInStatus({ today, recorded, postponed }: WeighInContext): WeighInStatus {
  if (recorded) return 'done';
  if (!canStillBeSaved(today)) return 'expired';
  if (today !== sundayOf(weighInWeekFor(today))) return 'catchUp';
  return postponed ? 'postponed' : 'toAsk';
}

function hasAtMostOneDecimal(weightKg: number): boolean {
  return Math.round(weightKg * 10) / 10 === weightKg;
}

function isValidWeight(weightKg: number): boolean {
  return Number.isFinite(weightKg) && weightKg > 0 && hasAtMostOneDecimal(weightKg);
}

export function createWeighIn(input: {
  today: CalendarDate;
  weightKg: number;
  fastingConfirmed: boolean;
}): WeighInResult {
  const { today, weightKg, fastingConfirmed } = input;
  if (!canStillBeSaved(today)) return { ok: false, error: 'expired' };
  if (!fastingConfirmed) return { ok: false, error: 'fastingNotConfirmed' };
  if (!isValidWeight(weightKg)) return { ok: false, error: 'invalidWeight' };
  const weighIn: WeighIn = {
    week: weighInWeekFor(today),
    weightKg,
    measuredOn: today,
    fastingConfirmed,
  };
  return { ok: true, weighIn };
}
