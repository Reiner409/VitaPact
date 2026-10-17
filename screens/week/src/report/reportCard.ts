import { mondayOf, sundayOf } from '@vitapact/core/calendar';
import type { ReportCard, WeekReportInput } from '@vitapact/core/report';
import { contentKey, pillarKey, type useTranslation } from '@vitapact/i18n';
import { verdictBand } from '@vitapact/core/scoring';
import { formatDay } from '../days/formatDay';

type Translate = ReturnType<typeof useTranslation>['t'];

const roundToTenth = (value: number) => Math.round(value * 10) / 10;

function weightLabel(t: Translate, input: WeekReportInput): string | undefined {
  const { weightKg, previousWeightKg, hideWeight } = input;
  if (weightKg === undefined) return undefined;
  const change =
    previousWeightKg === undefined ? undefined : roundToTenth(weightKg - previousWeightKg);
  if (hideWeight) return change === undefined ? undefined : t('week:report.change', { change });
  if (change === undefined) return t('week:report.weight', { weight: roundToTenth(weightKg) });
  return t('week:report.weightAndChange', { weight: roundToTenth(weightKg), change });
}

function indicatorsOf(t: Translate, input: WeekReportInput): ReportCard['indicators'] {
  return [
    {
      pillar: 'sleep',
      label: t(pillarKey.name('sleep')),
      value: t('week:report.sleep', { average: roundToTenth(input.sleepAvg), days: input.sleepOk }),
    },
    {
      pillar: 'training',
      label: t(pillarKey.name('training')),
      value: t('week:report.training', {
        done: input.trainDone,
        goal: input.trainGoal,
        minutes: input.trainMin,
      }),
    },
    {
      pillar: 'food',
      label: t(pillarKey.name('food')),
      value: t('week:report.days', { days: input.cleanOk }),
    },
    {
      pillar: 'sun',
      label: t(pillarKey.name('sun')),
      value: t('week:report.days', { days: input.sunOk }),
    },
  ];
}

/** What the image prints around the QR code, translated (RF-10, RF-11). */
export function reportCardOf(
  t: Translate,
  language: string,
  input: WeekReportInput,
  content: Uint8Array,
): ReportCard {
  const weight = weightLabel(t, input);
  return {
    content,
    nickname: input.nickname,
    userId: input.userId,
    weekLabel: t('week:report.weekLabel', { week: input.week }),
    periodLabel: t('week:report.period', {
      from: formatDay(mondayOf(input.week), language, 'short'),
      to: formatDay(sundayOf(input.week), language, 'short'),
    }),
    scoreLabel: String(input.score),
    verdictLabel: t(contentKey.verdictTitle(verdictBand(input.score))),
    indicators: indicatorsOf(t, input),
    ...(weight !== undefined && { weightLabel: weight }),
    motto: t('week:report.motto'),
  };
}
