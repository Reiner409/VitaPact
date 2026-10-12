import { isoWeekOf, previousWeek } from '@vitapact/core/calendar';
import type { CalendarDate } from '@vitapact/core/calendar';
import type { Goals, VitaPactDatabase } from '@vitapact/core/storage';
import { useState } from 'react';
import { WeekHeader } from './WeekHeader';
import { WeekPillars } from './WeekPillars';
import { WeekScore } from './WeekScore';
import { nextWeek } from './week/weekNavigation';
import { toPillarGoals } from './week/weekSummary';
import { useWeek } from './week/useWeek';

export interface WeekViewProps {
  db: VitaPactDatabase;
  goals: Goals;
  today: CalendarDate;
}

/** RF-08, RF-09: the chosen week's score first, then its pillars (D24). */
export function WeekView({ db, goals, today }: WeekViewProps) {
  const currentWeek = isoWeekOf(today);
  const [week, setWeek] = useState(currentWeek);
  const summary = useWeek(db, week, goals);
  return (
    <>
      <WeekHeader
        week={week}
        currentWeek={currentWeek}
        onPrevious={() => setWeek(previousWeek(week))}
        onNext={() => setWeek(nextWeek(week))}
      />
      {summary && (
        <>
          <WeekScore score={summary.score} band={summary.band} />
          <WeekPillars pillars={summary.pillars} goals={toPillarGoals(goals)} />
        </>
      )}
    </>
  );
}
