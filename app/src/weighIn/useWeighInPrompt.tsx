import { MAX_WEIGHT_KG, MIN_WEIGHT_KG, type CalendarDate } from '@vitapact/core/calendar';
import type { VitaPactDatabase } from '@vitapact/core/storage';
import { useTranslation } from '@vitapact/i18n';
import { WeighInBanner, WeighInDialog } from '@vitapact/ui';
import { useWeighIn } from './useWeighIn';

/**
 * The weigh-in dialog and its reminder banner, owned by the shell so they reach every screen
 * without screens importing each other (F3-TD-08, F3-TD-09).
 */
export function useWeighInPrompt(db: VitaPactDatabase, today: CalendarDate) {
  const { t } = useTranslation('app');
  const weighIn = useWeighIn(db, today);

  const banner = weighIn.reminderShown ? (
    <WeighInBanner
      message={t(
        weighIn.status === 'postponed' ? 'weighIn.reminderToday' : 'weighIn.reminderCatchUp',
      )}
      actionLabel={t('weighIn.open')}
      onWeighIn={weighIn.reopen}
    />
  ) : undefined;

  const dialog = (
    <WeighInDialog
      opened={weighIn.dialogOpened}
      labels={{
        title: t('weighIn.title'),
        close: t('weighIn.close'),
        weight: t('weighIn.weight'),
        unit: t('weighIn.unit'),
        fasting: t('weighIn.fasting'),
        save: t('weighIn.save'),
        later: t('weighIn.later'),
        outOfRange: t('weighIn.outOfRange', { min: MIN_WEIGHT_KG, max: MAX_WEIGHT_KG }),
      }}
      minKg={MIN_WEIGHT_KG}
      maxKg={MAX_WEIGHT_KG}
      onSave={(weightKg) => void weighIn.save(weightKg)}
      onLater={weighIn.later}
    />
  );

  return { banner, dialog };
}
