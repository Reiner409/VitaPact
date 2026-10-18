import { MAX_WEIGHT_KG, MIN_WEIGHT_KG } from '../../calendar';
import { isNote } from '../notes/note-shape';
import { PROFILE_ID } from '../records';
import type { TableName } from '../schema';
import {
  arrayOf,
  both,
  isBoolean,
  isDate,
  isNonNegative,
  isRecord,
  isWeek,
  isLiteral,
  isNumber,
  isString,
  oneOf,
  optional,
  recordOf,
  shape,
  type Check,
} from '../validation/shape';

const isProfile = shape({
  id: isLiteral(PROFILE_ID),
  userId: isString,
  nickname: isString,
  goals: shape({
    sleepHours: isNonNegative,
    workoutsPerWeek: isNonNegative,
    sunMinutes: isNonNegative,
  }),
  theme: isLiteral('light'),
  hideWeight: isBoolean,
  noteLock: optional(
    shape({ salt: isString, check: shape({ ciphertext: isString, iv: isString }) }),
  ),
  createdAt: isString,
});

const isGroup = shape({
  id: isString,
  name: isString,
  stake: isString,
  stakeRotates: optional(isBoolean),
  memberIds: arrayOf(isString),
  createdAt: isString,
});

const isPillarValue = oneOf(isNumber, isString, isBoolean, isLiteral(null));

const isDailyEntry = shape({
  date: isDate,
  pillars: recordOf(recordOf(isPillarValue)),
  updatedAt: isString,
});

const isWeighInWeight: Check = (value) =>
  isNumber(value) && (value as number) >= MIN_WEIGHT_KG && (value as number) <= MAX_WEIGHT_KG;

const isWeighIn = shape({
  week: isWeek,
  weightKg: isWeighInWeight,
  measuredOn: isDate,
  fastingConfirmed: isBoolean,
});

const isFriend = shape({
  userId: isString,
  nickname: isString,
  publicKey: isString,
  firstSeenAt: isString,
  lastReportAt: isString,
});

const isReportSummary = shape({
  v: isNumber,
  uid: isString,
  nick: isString,
  generatedOn: isDate,
  week: isWeek,
  from: isDate,
  to: isDate,
  logged: isNumber,
  sleepAvg: isNumber,
  sleepOk: isNumber,
  trainDone: isNumber,
  trainGoal: isNumber,
  trainMin: isNumber,
  cleanOk: isNumber,
  sunOk: isNumber,
  weight: optional(isNumber),
  delta: optional(isNumber),
  score: isNumber,
  prevScore: optional(isNumber),
  comeback: isBoolean,
  pub: isString,
  sig: isString,
});

const isWrittenByItsFriend: Check = (value) =>
  isRecord(value) &&
  isRecord(value['summary']) &&
  value['summary']['uid'] === value['userId'] &&
  value['summary']['week'] === value['week'];

const isFriendReport = both(
  shape({ userId: isString, week: isWeek, summary: isReportSummary, importedAt: isString }),
  isWrittenByItsFriend,
);

/** The check every row of a table must pass before an import may write anything. */
export const ROW_CHECKS: Record<TableName, Check> = {
  profile: isProfile,
  groups: isGroup,
  dailyEntries: isDailyEntry,
  weighIns: isWeighIn,
  friends: isFriend,
  friendReports: isFriendReport,
  notes: isNote,
};
