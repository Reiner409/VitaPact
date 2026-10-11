/** Small composable checks that tell whether untrusted JSON has the expected shape. */
export type Check = (value: unknown) => boolean;

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isString: Check = (value) => typeof value === 'string';
export const isBoolean: Check = (value) => typeof value === 'boolean';
export const isNumber: Check = (value) => typeof value === 'number' && Number.isFinite(value);
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

export const recordOf =
  (check: Check): Check =>
  (value) =>
    isRecord(value) && Object.values(value).every(check);

/** An object with exactly these fields: unknown fields are rejected, never written. */
export const shape =
  (fields: Record<string, Check>): Check =>
  (value) =>
    isRecord(value) &&
    Object.keys(value).every((key) => key in fields) &&
    Object.entries(fields).every(([key, check]) => check(value[key]));

export const oneOf =
  (...checks: Check[]): Check =>
  (value) =>
    checks.some((check) => check(value));
