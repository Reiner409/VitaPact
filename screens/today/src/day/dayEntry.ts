import type { CalendarDate } from '@vitapact/core/calendar';
import {
  validatePillarValues,
  type DayValues,
  type Pillar,
  type PillarValues,
} from '@vitapact/core/pillars';
import type { DailyEntry, PillarValue } from '@vitapact/core/storage';

/** Drops answers to fields no longer asked, such as minutes after switching training to "no". */
function withoutUnasked(pillar: Pillar, values: PillarValues): PillarValues {
  const unasked = new Set(
    validatePillarValues(pillar, values)
      .filter(({ code }) => code === 'unexpected')
      .map(({ field }) => field),
  );
  return Object.fromEntries(Object.entries(values).filter(([field]) => !unasked.has(field)));
}

/** Storage keeps only answered fields. */
const storedValuesOf = (values: PillarValues): Record<string, PillarValue> =>
  Object.fromEntries(
    Object.entries(values).flatMap(([field, value]) =>
      value === undefined ? [] : [[field, value] as const],
    ),
  );

/** The pillars with an empty or invalid answer, named in the notice when the day is not saved. */
export const incompletePillars = (pillars: readonly Pillar[], values: DayValues): Pillar[] =>
  pillars.filter(
    (pillar) =>
      validatePillarValues(pillar, withoutUnasked(pillar, values[pillar.id] ?? {})).length > 0,
  );

/**
 * The entry to save for the day, or `undefined` while a field is empty or invalid. Every pillar
 * must be answered: an unanswered pillar would count as a missed goal in the week (RF-03).
 */
export function dayEntryOf(
  pillars: readonly Pillar[],
  values: DayValues,
  date: CalendarDate,
  savedAt: Date,
): DailyEntry | undefined {
  const cleaned = Object.fromEntries(
    pillars.map((pillar) => [pillar.id, withoutUnasked(pillar, values[pillar.id] ?? {})]),
  );
  const complete = pillars.every(
    (pillar) => validatePillarValues(pillar, cleaned[pillar.id] ?? {}).length === 0,
  );
  if (!complete) return undefined;
  const pillarsToStore = Object.fromEntries(
    Object.entries(cleaned).map(([pillar, values]) => [pillar, storedValuesOf(values)]),
  );
  return { date, pillars: pillarsToStore, updatedAt: savedAt.toISOString() };
}
