import { pillarRegistry } from '@vitapact/core/pillars';
import { pillarKey, useTranslation } from '@vitapact/i18n';
import { Button, Modal, Stack } from '@vitapact/ui';
import { formatDay } from './formatDay';
import { answerLines } from './dayText';
import type { WeekDaySummary } from '../week/weekSummary';

export interface DayDetailProps {
  day: WeekDaySummary | undefined;
  /** Shown only while the week is open (RF-04); closed weeks are read-only. */
  onEdit: (() => void) | undefined;
  onClose: () => void;
}

/** Section 5.3: a day's answers, opened from its tile. */
export function DayDetail({ day, onEdit, onClose }: DayDetailProps) {
  const { t, i18n } = useTranslation('week');
  return (
    <Modal
      opened={day !== undefined}
      onClose={onClose}
      title={day ? formatDay(day.date, i18n.language, 'long') : ''}
      closeLabel={t('day.close')}
    >
      <Stack>
        {day?.values ? (
          pillarRegistry.list().map((pillar) => (
            <section key={pillar.id} aria-label={t(pillarKey.name(pillar.id))}>
              <h3>{t(pillarKey.name(pillar.id))}</h3>
              {answerLines(t, pillar, day.values?.[pillar.id] ?? {}).map(({ label, answer }) => (
                <p key={label}>{t('day.answer', { label, answer })}</p>
              ))}
            </section>
          ))
        ) : (
          <p>{t('day.notLogged')}</p>
        )}
        {onEdit && (
          <div>
            <Button onClick={onEdit}>{t('day.edit')}</Button>
          </div>
        )}
      </Stack>
    </Modal>
  );
}
