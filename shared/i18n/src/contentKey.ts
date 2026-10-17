/** Score bands, the same ids as VERDICT_BANDS in @vitapact/core/scoring. */
export type VerdictBandId = 'pauseWeek' | 'lightWeek' | 'solidBase' | 'onIt' | 'greatShape';

/** Keys of the shared `content` namespace built from a band (G5.3, checked in contentKey.test). */
export const contentKey = {
  verdictTitle: (band: VerdictBandId) => `content:verdict.${band}.title` as const,
};
