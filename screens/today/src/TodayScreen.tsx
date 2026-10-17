import { toCalendarDate, type CalendarDate } from '@vitapact/core/calendar';
import { pillarRegistry } from '@vitapact/core/pillars';
import { DEFAULT_GOALS, type Profile, type VitaPactDatabase } from '@vitapact/core/storage';
import { Stack } from '@vitapact/ui';
import { useState } from 'react';
import { DayHeader } from './day/DayHeader';
import { useDayValues } from './day/useDayValues';
import { SaveDay } from './day/SaveDay';
import { useSaveDay } from './day/useSaveDay';
import { pillarGoalsOf } from './pillars/pillarGoals';
import { TodayPillarCard } from './pillars/TodayPillarCard';
import { TodayWeekStrip } from './week/TodayWeekStrip';
import { useWeekDays } from './week/useWeekDays';

export interface TodayScreenProps {
  db: VitaPactDatabase;
  profile: Profile | undefined;
  /** Injected by tests; the app shows the user's own day. */
  today?: CalendarDate;
  now?: () => Date;
}

export function TodayScreen({
  db,
  profile,
  today = toCalendarDate(new Date()),
  now = () => new Date(),
}: TodayScreenProps) {
  const [day, setDay] = useState(today);
  const { values, setField } = useDayValues(db, day);
  const goals = pillarGoalsOf(profile?.goals ?? DEFAULT_GOALS);
  const week = useWeekDays(db, today, goals);
  const saving = useSaveDay(db, week.reload, now);

  return (
    <Stack>
      <DayHeader date={day} />
      <TodayWeekStrip days={week.days} today={today} onSelectDay={setDay} />
      {pillarRegistry.list().map((pillar) => (
        <TodayPillarCard
          key={pillar.id}
          pillar={pillar}
          goal={goals[pillar.id] ?? pillar.goal.default}
          values={values[pillar.id] ?? {}}
          onChange={(field, value) => setField(pillar.id, field, value)}
          showMissing={saving.triedToSave}
        />
      ))}
      <SaveDay
        onSave={() => void saving.save(day, values)}
        savedScore={week.days.find(({ date }) => date === day)?.score ?? null}
        notice={saving.notice}
        onCloseNotice={saving.closeNotice}
      />
    </Stack>
  );
}
