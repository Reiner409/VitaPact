/** Verdict bands from the lowest (section 9); each id is a translation key in the content namespace. */
export const VERDICT_BANDS = ['pauseWeek', 'lightWeek', 'solidBase', 'onIt', 'greatShape'] as const;

export type VerdictBand = (typeof VERDICT_BANDS)[number];

const BAND_FLOORS: ReadonlyArray<readonly [number, VerdictBand]> = [
  [85, 'greatShape'],
  [70, 'onIt'],
  [50, 'solidBase'],
  [30, 'lightWeek'],
];

export function verdictBand(score: number): VerdictBand {
  return BAND_FLOORS.find(([floor]) => score >= floor)?.[1] ?? 'pauseWeek';
}
