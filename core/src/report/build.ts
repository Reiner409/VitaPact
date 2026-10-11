import { mondayOf, sundayOf, type CalendarDate, type IsoWeek } from '../calendar';
import { REPORT_VERSION, isComeback, roundToTenth, type SignedContent } from './summary';

/** The week as the app computed it (F2-06, F2-08) plus who is sending it. */
export interface WeekReportInput {
  userId: string;
  nickname: string;
  hideWeight: boolean;
  generatedOn: CalendarDate;
  week: IsoWeek;
  logged: number;
  sleepAvg: number;
  sleepOk: number;
  trainDone: number;
  trainGoal: number;
  trainMin: number;
  cleanOk: number;
  sunOk: number;
  /** Missing when the week has no weigh-in. */
  weightKg?: number;
  /** The weigh-in of the previous ISO week, never an older one: without it there is no change. */
  previousWeightKg?: number;
  score: number;
  prevScore?: number;
}

type WeightFields = Pick<SignedContent, 'weight' | 'delta'>;

/** D11: hiding the weight drops the absolute value only; the change stays visible to friends. */
function weightFields(input: WeekReportInput): WeightFields {
  const { weightKg, previousWeightKg, hideWeight } = input;
  if (weightKg === undefined) return {};
  return {
    ...(!hideWeight && { weight: roundToTenth(weightKg) }),
    ...(previousWeightKg !== undefined && {
      delta: roundToTenth(weightKg - previousWeightKg),
    }),
  };
}

export function buildSignedContent(input: WeekReportInput, publicKey: string): SignedContent {
  return {
    v: REPORT_VERSION,
    uid: input.userId,
    nick: input.nickname,
    generatedOn: input.generatedOn,
    week: input.week,
    from: mondayOf(input.week),
    to: sundayOf(input.week),
    logged: input.logged,
    sleepAvg: roundToTenth(input.sleepAvg),
    sleepOk: input.sleepOk,
    trainDone: input.trainDone,
    trainGoal: input.trainGoal,
    trainMin: input.trainMin,
    cleanOk: input.cleanOk,
    sunOk: input.sunOk,
    ...weightFields(input),
    score: input.score,
    ...(input.prevScore !== undefined && { prevScore: input.prevScore }),
    comeback: isComeback(input.score, input.prevScore),
    pub: publicKey,
  };
}
