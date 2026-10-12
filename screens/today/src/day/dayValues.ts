import type { DayValues, FieldValue, PillarValues } from '@vitapact/core/pillars';
import type { DailyEntry, PillarValue } from '@vitapact/core/storage';

const isFieldValue = (value: PillarValue | undefined): value is FieldValue =>
  value !== null && value !== undefined;

/** Storage may hold `null` for a field left empty; the cards treat it as not answered. */
function pillarValuesOf(stored: Readonly<Record<string, PillarValue>>): PillarValues {
  return Object.fromEntries(
    Object.entries(stored).flatMap(([field, value]) =>
      isFieldValue(value) ? [[field, value]] : [],
    ),
  );
}

export function dayValuesOf(entry: DailyEntry | undefined): DayValues {
  if (!entry) return {};
  return Object.fromEntries(
    Object.entries(entry.pillars).map(([pillar, values]) => [pillar, pillarValuesOf(values)]),
  );
}
