import {
  addDays,
  isoWeekOf,
  mondayOf,
  toCalendarDate,
  type CalendarDate,
} from '@vitapact/core/calendar';
import {
  DEFAULT_GOALS,
  pillarGoalsOf,
  type Profile,
  type VitaPactDatabase,
} from '@vitapact/core/storage';
import { useTranslation } from '@vitapact/i18n';
import { copyImage as copyImageToClipboard, getPlatform, type CopyImage } from '@vitapact/platform';
import { Button, PageHeader, Stack } from '@vitapact/ui';
import { useState } from 'react';
import { DayDetail } from './days/DayDetail';
import { WeekDays } from './days/WeekDays';
import { ReportDialog } from './report/ReportDialog';
import { useReport, type SaveFile } from './report/useReport';
import { WeekScore } from './week/WeekScore';
import { WeekSelector } from './week/WeekSelector';
import { useWeekData } from './week/useWeekData';
import type { WeekDaySummary } from '@vitapact/core/scoring';
import { WeightChart } from './weight/WeightChart';

export interface WeekScreenProps {
  db: VitaPactDatabase;
  profile: Profile | undefined;
  /** Opens a day of the current week on Today to edit it (RF-04). */
  onEditDay?: (date: CalendarDate) => void;
  /** Injected by tests; the app shows the user's own week. */
  today?: CalendarDate;
  saveFile?: SaveFile;
  copyImage?: CopyImage;
}

const nextWeekOf = (week: string) => isoWeekOf(addDays(mondayOf(week), 7));
const previousWeekOf = (week: string) => isoWeekOf(addDays(mondayOf(week), -7));
const defaultSaveFile: SaveFile = (request) => getPlatform().saveFile(request);

type WeekState = ReturnType<typeof useWeekState>;

function useWeekState({
  db,
  profile,
  onEditDay,
  today,
  saveFile,
  copyImage,
}: Required<Omit<WeekScreenProps, 'profile' | 'onEditDay'>> &
  Pick<WeekScreenProps, 'profile' | 'onEditDay'>) {
  const currentWeek = isoWeekOf(today);
  const [week, setWeek] = useState(currentWeek);
  const [openDay, setOpenDay] = useState<WeekDaySummary>();
  const goals = profile?.goals ?? DEFAULT_GOALS;
  const data = useWeekData(db, week, pillarGoalsOf(goals));
  const report = useReport(profile && data && { db, profile, data, today }, {
    saveFile,
    copyImage,
  });
  // Only days of the open week that have already come can still be changed (RF-04).
  const canEdit = week === currentWeek && openDay !== undefined && openDay.date <= today;
  const editOpenDay = canEdit && onEditDay ? () => onEditDay(openDay.date) : undefined;
  return {
    week,
    setWeek,
    isCurrentWeek: week === currentWeek,
    openDay,
    setOpenDay,
    editOpenDay,
    trainingGoal: goals.workoutsPerWeek,
    data,
    report,
    canReport: data !== undefined && profile !== undefined,
  };
}

function WeekContent({ state, today }: { state: WeekState; today: CalendarDate }) {
  const { data } = state;
  if (!data) return null;
  return (
    <>
      <WeekScore summary={data.summary} trainingGoal={state.trainingGoal} />
      <WeekDays days={data.summary.days} today={today} onSelect={state.setOpenDay} />
      <WeightChart week={state.week} weighIns={data.weighIns} />
    </>
  );
}

export function WeekScreen({
  today = toCalendarDate(new Date()),
  saveFile = defaultSaveFile,
  copyImage = copyImageToClipboard,
  ...props
}: WeekScreenProps) {
  const { t } = useTranslation('week');
  const state = useWeekState({ ...props, today, saveFile, copyImage });
  const { week, report } = state;

  return (
    <Stack>
      <PageHeader title={t('title')} />
      <WeekSelector
        week={week}
        isCurrentWeek={state.isCurrentWeek}
        onPrevious={() => state.setWeek(previousWeekOf(week))}
        onNext={() => state.setWeek(nextWeekOf(week))}
      />
      <WeekContent state={state} today={today} />
      <div>
        <Button onClick={() => void report.open()} disabled={!state.canReport}>
          {t('report.create')}
        </Button>
      </div>
      <DayDetail
        day={state.openDay}
        onEdit={state.editOpenDay}
        onClose={() => state.setOpenDay(undefined)}
      />
      <ReportDialog
        state={report.state}
        onSave={() => void report.save()}
        onCopy={() => void report.copy()}
        onClose={report.close}
      />
    </Stack>
  );
}
