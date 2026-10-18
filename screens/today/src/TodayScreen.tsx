import { toCalendarDate, type CalendarDate } from '@vitapact/core/calendar';
import { pillarRegistry } from '@vitapact/core/pillars';
import {
  DEFAULT_GOALS,
  pillarGoalsOf,
  type Profile,
  type VitaPactDatabase,
} from '@vitapact/core/storage';
import { ScoreRing, Stack } from '@vitapact/ui';
import { pillarKey, useTranslation } from '@vitapact/i18n';
import { dayScore } from '@vitapact/core/scoring';
import { useState } from 'react';
import { DayHeader } from './day/DayHeader';
import { useDayValues } from './day/useDayValues';
import { SaveDay } from './day/SaveDay';
import { useSaveDay } from './day/useSaveDay';
import { TodayPillarCard } from './pillars/TodayPillarCard';
import { TodayWeekStrip } from './week/TodayWeekStrip';
import { useWeekDays } from './week/useWeekDays';

export interface TodayScreenProps {
  db: VitaPactDatabase;
  profile: Profile | undefined;
  /** Injected by tests; the app shows the user's own day. */
  today?: CalendarDate;
  /** A day of this week another screen asked to edit (RF-04); today otherwise. */
  openedDay?: CalendarDate | undefined;
  now?: () => Date;
}

function useToday({
  db,
  profile,
  today = toCalendarDate(new Date()),
  openedDay,
  now = () => new Date(),
}: TodayScreenProps) {
  const [day, setDay] = useState(openedDay ?? today);
  const dayValues = useDayValues(db, day);
  const goals = pillarGoalsOf(profile?.goals ?? DEFAULT_GOALS);
  const week = useWeekDays(db, today, goals);
  const onSaved = () => {
    dayValues.markSaved();
    week.reload();
  };
  const saving = useSaveDay(db, onSaved, now);
  return { today, day, setDay, ...dayValues, goals, week, saving, now };
}

export function TodayScreen(props: TodayScreenProps) {
  const { t } = useTranslation('today');
  const { today, day, setDay, values, setField, changed, goals, week, saving, now } =
    useToday(props);

  return (
    <Stack>
      <DayHeader date={day} nickname={props.profile?.nickname} now={now()} />
      <TodayWeekStrip days={week.days} today={today} onSelectDay={setDay} />
      {/* Follows every answer as it is given; only "Save day" stores it (F3-TD-06). */}
      <ScoreRing score={dayScore(values, goals)} label={t('dayScore')} />
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
        changed={changed}
        notice={saving.notice}
        incompleteTries={saving.incompleteTries}
        incompletePillars={saving.incomplete.map((id) => t(pillarKey.name(id)))}
        onCloseNotice={saving.closeNotice}
      />
    </Stack>
  );
}
