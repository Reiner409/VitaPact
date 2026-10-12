import { toCalendarDate, type CalendarDate } from '@vitapact/core/calendar';
import { pillarRegistry } from '@vitapact/core/pillars';
import { DEFAULT_GOALS, type Profile, type VitaPactDatabase } from '@vitapact/core/storage';
import { DayHeader } from './day/DayHeader';
import { useDayValues } from './day/useDayValues';
import { pillarGoalsOf } from './pillars/pillarGoals';
import { TodayPillarCard } from './pillars/TodayPillarCard';

export interface TodayScreenProps {
  db: VitaPactDatabase;
  profile: Profile | undefined;
  /** Injected by tests; the app shows the user's own day. */
  today?: CalendarDate;
}

export function TodayScreen({ db, profile, today = toCalendarDate(new Date()) }: TodayScreenProps) {
  const { values, setField } = useDayValues(db, today);
  const goals = pillarGoalsOf(profile?.goals ?? DEFAULT_GOALS);
  return (
    <>
      <DayHeader date={today} />
      {pillarRegistry.list().map((pillar) => (
        <TodayPillarCard
          key={pillar.id}
          pillar={pillar}
          goal={goals[pillar.id] ?? pillar.goal.default}
          values={values[pillar.id] ?? {}}
          onChange={(field, value) => setField(pillar.id, field, value)}
        />
      ))}
    </>
  );
}
