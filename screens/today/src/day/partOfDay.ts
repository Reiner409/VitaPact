export type PartOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

/** Which greeting fits the local hour: morning from 5, afternoon from 12, evening from 18, night from 23. */
export function partOfDay(now: Date): PartOfDay {
  const hour = now.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 23) return 'evening';
  return 'night';
}
