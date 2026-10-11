/** The five verdict bands of section 9, from the lowest; the same names as in core's scoring module. */
export type ScoreBand = 'pauseWeek' | 'lightWeek' | 'solidBase' | 'onIt' | 'greatShape';

/**
 * Bands are shades of the sage greens, lighter for lower scores: a low score is never
 * coloured as an error (G4.3).
 */
export const bandColor: Record<ScoreBand, string> = {
  pauseWeek: 'var(--mantine-color-sage-1)',
  lightWeek: 'var(--mantine-color-sage-3)',
  solidBase: 'var(--mantine-color-sage-4)',
  onIt: 'var(--mantine-color-sage-6)',
  greatShape: 'var(--mantine-color-sage-7)',
};
