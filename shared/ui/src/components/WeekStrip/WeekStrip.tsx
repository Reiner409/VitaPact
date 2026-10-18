import { SimpleGrid } from '@mantine/core';
import { tokens } from '../../tokens';
import { usePhoneLayout } from '../phoneLayout';
import { DayTile } from '../DayTile/DayTile';
import type { ScoreBand } from '../scoreBand';

export interface WeekStripDay {
  /** Translated short name of the day. */
  dayName: string;
  score: number | null;
  band: ScoreBand | null;
}

export interface WeekStripProps {
  /** Translated name of the strip for screen readers. */
  label: string;
  /** The seven days from Monday to Sunday. */
  days: WeekStripDay[];
  /** Position of today in `days`, or `null` when the week shown is not the current one. */
  todayIndex: number | null;
  missingLabel: string;
  todayLabel: string;
  onSelectDay: (index: number) => void;
}

/** Seven DayTiles from Monday to Sunday in one row, with today highlighted; compact on phones. */
export function WeekStrip({
  label,
  days,
  todayIndex,
  missingLabel,
  todayLabel,
  onSelectDay,
}: WeekStripProps) {
  const compact = usePhoneLayout();
  return (
    <SimpleGrid
      component="ul"
      aria-label={label}
      cols={7}
      spacing={compact ? tokens.space[1] : 'xs'}
      style={{ listStyle: 'none', margin: 0, padding: 0 }}
    >
      {days.map((day, index) => (
        <li key={day.dayName}>
          <DayTile
            {...day}
            missingLabel={missingLabel}
            todayLabel={todayLabel}
            today={index === todayIndex}
            compact={compact}
            onClick={() => onSelectDay(index)}
          />
        </li>
      ))}
    </SimpleGrid>
  );
}
