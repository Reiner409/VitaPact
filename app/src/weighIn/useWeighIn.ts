import {
  createWeighIn,
  weighInStatus,
  weighInWeekFor,
  type CalendarDate,
  type IsoWeek,
  type WeighInStatus,
} from '@vitapact/core/calendar';
import { getWeighIn, saveWeighIn, type VitaPactDatabase } from '@vitapact/core/storage';
import { useEffect, useState } from 'react';

interface Recorded {
  week: IsoWeek;
  recorded: boolean;
}

/**
 * The weigh-in that is due today and what the app shows for it: the dialog opens by itself on
 * Sunday (RF-05); after "Later", and on Monday and Tuesday, a reminder stays on every screen and
 * reopens the dialog (RF-06, RF-07). "Later" lasts until the app is closed, so the next opening
 * on Sunday asks again.
 */
export function useWeighIn(db: VitaPactDatabase, today: CalendarDate) {
  const week = weighInWeekFor(today);
  const [saved, setSaved] = useState<Recorded>();
  const [postponed, setPostponed] = useState(false);
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    let current = true;
    void getWeighIn(db, week).then((weighIn) => {
      if (current) setSaved({ week, recorded: weighIn !== undefined });
    });
    return () => {
      current = false;
    };
  }, [db, week]);

  // Nothing shows until the saved weigh-in is read, so the dialog never flashes open.
  const status: WeighInStatus | undefined =
    saved?.week === week
      ? weighInStatus({ today, recorded: saved.recorded, postponed })
      : undefined;
  const reminderShown = status === 'postponed' || status === 'catchUp';

  const later = () => {
    setPostponed(true);
    setReopened(false);
  };
  const save = async (weightKg: number) => {
    const result = createWeighIn({ today, weightKg, fastingConfirmed: true });
    if (result.ok) {
      await saveWeighIn(db, result.weighIn);
      setSaved({ week, recorded: true });
    }
    later();
  };

  return {
    status,
    reminderShown,
    dialogOpened: status === 'toAsk' || (reminderShown && reopened),
    reopen: () => setReopened(true),
    later,
    save,
  };
}
