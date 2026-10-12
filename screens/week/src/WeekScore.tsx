import type { VerdictBand } from '@vitapact/core/scoring';
import { useTranslation } from '@vitapact/i18n';
import { ScoreRing, VerdictLabel } from '@vitapact/ui';

export interface WeekScoreProps {
  score: number;
  band: VerdictBand;
}

/** F3-WK-02, D24: the week score comes first, with its encouraging verdict (RF-15). */
export function WeekScore({ score, band }: WeekScoreProps) {
  const { t } = useTranslation('week');
  return (
    <ScoreRing score={score} label={t('score.label')}>
      <VerdictLabel band={band}>{t(`content:verdict.${band}.title`)}</VerdictLabel>
    </ScoreRing>
  );
}
