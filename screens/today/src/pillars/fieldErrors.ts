import {
  validatePillarValues,
  type FieldErrorCode,
  type Pillar,
  type PillarValues,
} from '@vitapact/core/pillars';

/**
 * Codes shown while the user types. A missing value is reported only when the day is saved, and a
 * value of a field that is no longer asked is dropped before saving.
 */
export type LiveErrorCode = Extract<FieldErrorCode, 'range' | 'step' | 'type'>;

const LIVE_CODES: ReadonlySet<FieldErrorCode> = new Set<LiveErrorCode>(['range', 'step', 'type']);

const isLive = (code: FieldErrorCode): code is LiveErrorCode => LIVE_CODES.has(code);

/** The live error of each field of a pillar, keyed by field. */
export function liveErrorsOf(pillar: Pillar, values: PillarValues): Map<string, LiveErrorCode> {
  return new Map(
    validatePillarValues(pillar, values).flatMap(({ field, code }) =>
      isLive(code) ? [[field, code] as const] : [],
    ),
  );
}
