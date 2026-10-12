import { isoWeekOf, previousWeek } from '@vitapact/core/calendar';
import type { CalendarDate } from '@vitapact/core/calendar';
import type { VitaPactDatabase } from '@vitapact/core/storage';
import { useState } from 'react';
import { WeekHeader } from './WeekHeader';
import { WeekPillars } from './WeekPillars';
import { WeekScore } from './WeekScore';
import { nextWeek } from './week/weekNavigation';
import { useWeek } from './week/useWeek';

export interface WeekViewProps {
  db: VitaPactDatabase;
  today: CalendarDate;
}

/** RF-08, RF-09: the chosen week's score first, then its pillars (D24). */
export function WeekView({ db, today }: WeekViewProps) {
  const currentWeek = isoWeekOf(today);
  const [week, setWeek] = useState(currentWeek);
  const loaded = useWeek(db, week);
  return (
    <>
      <WeekHeader
        week={week}
        currentWeek={currentWeek}
        onPrevious={() => setWeek(previousWeek(week))}
        onNext={() => setWeek(nextWeek(week))}
      />
      {loaded && (
        <>
          <WeekScore score={loaded.summary.score} band={loaded.summary.band} />
          <WeekPillars pillars={loaded.summary.pillars} goals={loaded.goals} />
        </>
      )}
    </>
  );
}
