import { parseCalendarDate, parseIsoWeek } from '../../calendar';

/** Small composable checks that tell whether untrusted JSON has the expected shape. */
export type Check = (value: unknown) => boolean;

/** Longer than any field the app writes, short enough that a hostile file cannot swell storage. */
export const MAX_STRING_LENGTH = 100_000;

/** Keys that would reach the prototype chain once the row is spread or stored. */
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const RECORD_KEY = /^[a-z][a-zA-Z0-9]{0,31}$/;

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isString: Check = (value) =>
  typeof value === 'string' && value.length <= MAX_STRING_LENGTH;
export const isBoolean: Check = (value) => typeof value === 'boolean';
export const isNumber: Check = (value) => typeof value === 'number' && Number.isFinite(value);
export const isNonNegative: Check = (value) => isNumber(value) && (value as number) >= 0;
export const isDate: Check = (value) =>
  isString(value) && parseCalendarDate(value as string) === value;
export const isWeek: Check = (value) => isString(value) && parseIsoWeek(value as string) === value;

export const isLiteral =
  (expected: unknown): Check =>
  (value) =>
    value === expected;

export const optional =
  (check: Check): Check =>
  (value) =>
    value === undefined || check(value);

export const arrayOf =
  (check: Check): Check =>
  (value) =>
    Array.isArray(value) && value.every(check);

const isSafeKey = (key: string) => !FORBIDDEN_KEYS.has(key);

/** A map with short camelCase keys, such as pillar ids or pillar field names. */
export const recordOf =
  (check: Check): Check =>
  (value) =>
    isRecord(value) &&
    Object.entries(value).every(
      ([key, item]) => isSafeKey(key) && RECORD_KEY.test(key) && check(item),
    );

/** An object with exactly these fields: unknown fields are rejected, never written. */
export const shape =
  (fields: Record<string, Check>): Check =>
  (value) =>
    isRecord(value) &&
    Object.keys(value).every((key) => isSafeKey(key) && Object.hasOwn(fields, key)) &&
    Object.entries(fields).every(([key, check]) => check(value[key]));

export const oneOf =
  (...checks: Check[]): Check =>
  (value) =>
    checks.some((check) => check(value));

export const both =
  (first: Check, second: Check): Check =>
  (value) =>
    first(value) && second(value);
