import { touchTarget } from './touchTarget';

/**
 * Shared by every field: the error is announced (role alert) and its text stays in
 * `color.text`, because clay text on the surface is only 3.2:1 (G4.3, RNF-10).
 * The clay colour still marks the field's border.
 */
export const fieldErrorProps = { role: 'alert', style: { color: 'var(--vp-color-text)' } };

export const fieldStyles = { input: { minHeight: touchTarget.minHeight } };

/** Mantine treats an absent prop and `undefined` alike; exactOptionalPropertyTypes does not. */
export function optional<Value>(name: string, value: Value | undefined) {
  return value === undefined ? {} : { [name]: value };
}
