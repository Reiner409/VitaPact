import { toCalendarDate } from '@vitapact/core/calendar';
import { DEFAULT_GOALS } from '@vitapact/core/storage';
import type { Profile, VitaPactDatabase } from '@vitapact/core/storage';
import { WeekView } from './WeekView';

export interface WeekScreenProps {
  db: VitaPactDatabase;
  profile: Profile | undefined;
}

/** The screen reads the clock once, so everything below it works on an injected day (G7.4). */
export function WeekScreen({ db, profile }: WeekScreenProps) {
  return (
    <WeekView db={db} goals={profile?.goals ?? DEFAULT_GOALS} today={toCalendarDate(new Date())} />
  );
}
