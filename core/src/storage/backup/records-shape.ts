import { parseCalendarDate, parseIsoWeek } from '../../calendar';
import { isNote } from '../notes/note-shape';
import { PROFILE_ID } from '../records';
import type { TableName } from '../schema';
import {
  arrayOf,
  isBoolean,
  isLiteral,
  isNumber,
  isString,
  oneOf,
  optional,
  recordOf,
  shape,
  type Check,
} from './shape';

const isDate: Check = (value) => isString(value) && parseCalendarDate(value as string) === value;
const isWeek: Check = (value) => isString(value) && parseIsoWeek(value as string) === value;

const isProfile = shape({
  id: isLiteral(PROFILE_ID),
  userId: isString,
  nickname: isString,
  goals: shape({ sleepHours: isNumber, workoutsPerWeek: isNumber, sunMinutes: isNumber }),
  theme: isLiteral('light'),
  hideWeight: isBoolean,
  createdAt: isString,
});

const isGroup = shape({
  id: isString,
  name: isString,
  stake: isString,
  memberIds: arrayOf(isString),
  createdAt: isString,
});

const isPillarValue = oneOf(isNumber, isString, isBoolean, isLiteral(null));

const isDailyEntry = shape({
  date: isDate,
  pillars: recordOf(recordOf(isPillarValue)),
  updatedAt: isString,
});

const isWeighIn = shape({
  week: isWeek,
  weightKg: isNumber,
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

const isFriendReport = shape({
  userId: isString,
  week: isWeek,
  summary: isReportSummary,
  importedAt: isString,
});

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
