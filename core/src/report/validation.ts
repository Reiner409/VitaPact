import {
  MAX_WEIGHT_KG,
  MIN_WEIGHT_KG,
  mondayOf,
  parseCalendarDate,
  parseIsoWeek,
  sundayOf,
} from '../calendar';
import { sleepPillar, trainingPillar, type Pillar } from '../pillars';
import {
  NICKNAME_MAX_LENGTH,
  REPORT_VERSION,
  isComeback,
  roundToTenth,
  type SignedContent,
} from './summary';

type Check = (value: unknown) => boolean;

const DAYS_IN_A_WEEK = 7;
const MAX_SCORE = 100;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
/** A raw P-256 public key is 65 bytes, 87 characters in base64url. */
const PUBLIC_KEY = /^[A-Za-z0-9_-]{87}$/;
/** Control characters, and lone surrogates that would not survive UTF-8. */
const UNPRINTABLE = /[\p{Cc}\p{Cs}]/u;

function numberFieldMax(pillar: Pillar, key: string): number {
  const field = pillar.fields.find((candidate) => candidate.key === key);
  if (field?.kind !== 'number') throw new Error(`${pillar.id}.${key} is not a number field`);
  return field.max;
}

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const integerFrom =
  (min: number, max: number): Check =>
  (value) =>
    Number.isInteger(value) && isNumber(value) && value >= min && value <= max;

const tenthsFrom =
  (min: number, max: number): Check =>
  (value) =>
    isNumber(value) && roundToTenth(value) === value && value >= min && value <= max;

const dayCount = integerFrom(0, DAYS_IN_A_WEEK);
const score = integerFrom(0, MAX_SCORE);
const calendarDate: Check = (value) =>
  typeof value === 'string' && parseCalendarDate(value) === value;

function isNickname(value: unknown): boolean {
  if (typeof value !== 'string' || value.trim() === '') return false;
  return [...value].length <= NICKNAME_MAX_LENGTH && !UNPRINTABLE.test(value);
}

const REQUIRED_FIELDS: Record<string, Check> = {
  v: (value) => value === REPORT_VERSION,
  uid: (value) => typeof value === 'string' && UUID.test(value),
  nick: isNickname,
  generatedOn: calendarDate,
  week: (value) => typeof value === 'string' && parseIsoWeek(value) === value,
  from: calendarDate,
  to: calendarDate,
  logged: dayCount,
  sleepAvg: tenthsFrom(0, numberFieldMax(sleepPillar, 'hours')),
  sleepOk: dayCount,
  trainDone: dayCount,
  trainGoal: integerFrom(trainingPillar.goal.min, trainingPillar.goal.max),
  trainMin: integerFrom(0, DAYS_IN_A_WEEK * numberFieldMax(trainingPillar, 'minutes')),
  cleanOk: dayCount,
  sunOk: dayCount,
  score,
  comeback: (value) => typeof value === 'boolean',
  pub: (value) => typeof value === 'string' && PUBLIC_KEY.test(value),
};

const OPTIONAL_FIELDS: Record<string, Check> = {
  weight: tenthsFrom(MIN_WEIGHT_KG, MAX_WEIGHT_KG),
  delta: tenthsFrom(MIN_WEIGHT_KG - MAX_WEIGHT_KG, MAX_WEIGHT_KG - MIN_WEIGHT_KG),
  prevScore: score,
};

function hasValidFields(record: Record<string, unknown>): boolean {
  const known = Object.keys(record).every(
    (field) => Object.hasOwn(REQUIRED_FIELDS, field) || Object.hasOwn(OPTIONAL_FIELDS, field),
  );
  const required = Object.entries(REQUIRED_FIELDS).every(([field, check]) => check(record[field]));
  const optional = Object.entries(OPTIONAL_FIELDS).every(
    ([field, check]) => !Object.hasOwn(record, field) || check(record[field]),
  );
  return known && required && optional;
}

/** Fields that are each valid on their own must also describe one coherent week. */
function isCoherent(content: SignedContent): boolean {
  const daysOnTarget = [content.sleepOk, content.trainDone, content.cleanOk, content.sunOk];
  return (
    content.from === mondayOf(content.week) &&
    content.to === sundayOf(content.week) &&
    content.generatedOn >= content.from &&
    daysOnTarget.every((days) => days <= content.logged) &&
    content.comeback === isComeback(content.score, content.prevScore)
  );
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** RNF-05: imported content is untrusted, so every field is checked for type and limits. */
export function parseSignedContent(value: unknown): SignedContent | undefined {
  if (!isRecord(value) || !hasValidFields(value)) return undefined;
  const content = value as unknown as SignedContent;
  return isCoherent(content) ? content : undefined;
}
