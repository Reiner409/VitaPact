import { pillarRegistry } from '@vitapact/core/pillars';
import type { Goals, Pillar } from '@vitapact/core/pillars';
import type { PillarStatistics } from '@vitapact/core/scoring';
import { useTranslation } from '@vitapact/i18n';
import { PillarSummary } from '@vitapact/ui';

export interface WeekPillarsProps {
  pillars: Readonly<Record<string, PillarStatistics>>;
  goals: Goals;
}

interface PillarText {
  readonly name: string;
  readonly average: string;
  readonly onGoal: string;
}

type Translate = ReturnType<typeof useTranslation>['t'];
type TextOf = (t: Translate, stats: PillarStatistics, goal: number) => PillarText;

const value = (stats: PillarStatistics) => ({ value: stats.average });
const count = (stats: PillarStatistics) => ({ count: stats.daysOnGoal });

/** Literal keys, so the key check sees every one of them (G5.3). */
const PILLAR_TEXT = new Map<string, TextOf>([
  [
    'sleep',
    (t, stats) => ({
      name: t('week:pillars.sleep.name'),
      average: t('week:pillars.sleep.average', value(stats)),
      onGoal: t('week:pillars.sleep.onGoal', count(stats)),
    }),
  ],
  [
    'training',
    (t, stats, goal) => ({
      name: t('week:pillars.training.name'),
      average: t('week:pillars.training.average', value(stats)),
      onGoal: t('week:pillars.training.onGoal', { ...count(stats), goal }),
    }),
  ],
  [
    'food',
    (t, stats) => ({
      name: t('week:pillars.food.name'),
      average: t('week:pillars.food.average', value(stats)),
      onGoal: t('week:pillars.food.onGoal', count(stats)),
    }),
  ],
  [
    'sun',
    (t, stats) => ({
      name: t('week:pillars.sun.name'),
      average: t('week:pillars.sun.average', value(stats)),
      onGoal: t('week:pillars.sun.onGoal', count(stats)),
    }),
  ],
]);

/** The ids that have texts, so a test can check that every pillar of the registry has them. */
export const PILLARS_WITH_TEXT: readonly string[] = [...PILLAR_TEXT.keys()];

/** F3-WK-02: one summary per pillar, in registry order. */
export function WeekPillars({ pillars, goals }: WeekPillarsProps) {
  const { t } = useTranslation('week');
  const noData = t('pillars.noData');
  return pillarRegistry.list().map((pillar) => {
    const stats = pillars[pillar.id];
    const textOf = PILLAR_TEXT.get(pillar.id);
    if (!stats || !textOf) return null;
    const text = textOf(t, stats, goalOf(pillar, goals));
    return (
      <PillarSummary
        key={pillar.id}
        pillar={pillar}
        name={text.name}
        averageLabel={stats.average === null ? noData : text.average}
        daysOnGoal={stats.daysOnGoal}
        daysOnGoalLabel={text.onGoal}
      />
    );
  });
}

function goalOf(pillar: Pillar, goals: Goals): number {
  return Object.hasOwn(goals, pillar.id) ? (goals[pillar.id] ?? 0) : pillar.goal.default;
}
