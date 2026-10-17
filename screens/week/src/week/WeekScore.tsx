import { pillarRegistry, type Pillar } from '@vitapact/core/pillars';
import type { PillarStatistics, WeekSummary } from '@vitapact/core/scoring';
import { contentKey, pillarKey, useTranslation } from '@vitapact/i18n';
import { PillarSummary, ScoreRing, Stack, VerdictLabel } from '@vitapact/ui';

type Translate = ReturnType<typeof useTranslation>['t'];

const NO_STATISTICS: PillarStatistics = { average: null, total: 0, daysOnGoal: 0 };

// Training shows its total minutes instead of an average.
const averageKeys = {
  sleep: 'pillars.average.sleep',
  food: 'pillars.average.food',
  sun: 'pillars.average.sun',
} as const;

function averageLabel(t: Translate, pillarId: string, statistics: PillarStatistics) {
  if (pillarId === 'training') return t('pillars.totalMinutes', { minutes: statistics.total });
  const key = averageKeys[pillarId as keyof typeof averageKeys];
  if (statistics.average === null || key === undefined) return t('pillars.noAverage');
  return t(key, { value: Math.round(statistics.average * 10) / 10 });
}

/** Training counts workouts against its weekly goal; the others count days out of seven. */
function pillarLabels(t: Translate, pillar: Pillar, statistics: PillarStatistics, goal: number) {
  const daysOnGoalLabel =
    pillar.id === 'training'
      ? t('pillars.workouts', { done: statistics.daysOnGoal, goal })
      : t('pillars.daysOnGoal', { count: statistics.daysOnGoal });
  return { averageLabel: averageLabel(t, pillar.id, statistics), daysOnGoalLabel };
}

export interface WeekScoreProps {
  summary: WeekSummary;
  trainingGoal: number;
}

/** Section 5.3: the score and verdict first, then the four pillars side by side. */
export function WeekScore({ summary, trainingGoal }: WeekScoreProps) {
  const { t } = useTranslation('week');
  return (
    <Stack>
      <ScoreRing score={summary.score} label={t('score')}>
        <VerdictLabel band={summary.band}>{t(contentKey.verdictTitle(summary.band))}</VerdictLabel>
      </ScoreRing>
      <Stack columns={4}>
        {pillarRegistry.list().map((pillar) => (
          <PillarSummary
            key={pillar.id}
            pillar={pillar}
            name={t(pillarKey.name(pillar.id))}
            daysOnGoal={summary.statistics.pillars[pillar.id]?.daysOnGoal ?? 0}
            {...pillarLabels(
              t,
              pillar,
              summary.statistics.pillars[pillar.id] ?? NO_STATISTICS,
              trainingGoal,
            )}
          />
        ))}
      </Stack>
    </Stack>
  );
}
