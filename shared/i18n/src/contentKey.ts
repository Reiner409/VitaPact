import content from '../locales/en/content.json';

/** Score bands, the same ids as VERDICT_BANDS in @vitapact/core/scoring. */
export type VerdictBandId = 'pauseWeek' | 'lightWeek' | 'solidBase' | 'onIt' | 'greatShape';

/** Keys of the shared `content` namespace built from a band (G5.3, checked in contentKey.test). */
export const contentKey = {
  verdictTitle: (band: VerdictBandId) => `content:verdict.${band}.title` as const,
  /** Section 9.1: a 0-based phrase index from core's `weekendPayer` to its key, e.g. "01". */
  weekendFriends: (index: number) => `content:weekend.friends.${phraseId(index)}` as const,
  weekendPayer: (index: number) => `content:weekend.payer.${phraseId(index)}` as const,
};

const phraseId = (index: number) => String(index + 1).padStart(2, '0');

/** How many phrases each version has, so core picks an index inside the list (section 9.1). */
export const WEEKEND_PHRASE_COUNTS = {
  friends: Object.keys(content.weekend.friends).length,
  payer: Object.keys(content.weekend.payer).length,
};
