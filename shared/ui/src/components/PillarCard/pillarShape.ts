/**
 * The part of a pillar module (core `Pillar`, F2-05) that PillarCard reads. Core pillars fit
 * it as they are, so screens pass `pillarRegistry.list()` items straight in (RF-23).
 */
export type PillarFieldValue = number | boolean | string;

export type PillarCardValues = Readonly<Record<string, PillarFieldValue | undefined>>;

interface FieldBase {
  readonly key: string;
  /** The field is asked only while another field holds this value, or a number above it. */
  readonly askedWhen?:
    | { readonly key: string; readonly equals: PillarFieldValue }
    | { readonly key: string; readonly above: number };
}

export type PillarCardField = FieldBase &
  (
    | {
        readonly kind: 'number';
        readonly unit: string;
        readonly min: number;
        readonly max: number;
        readonly step: number;
        readonly quickValues?: readonly number[];
      }
    | { readonly kind: 'scale'; readonly min: number; readonly max: number }
    | { readonly kind: 'yesNo' }
    | { readonly kind: 'choice'; readonly options: readonly string[] }
  );

export interface PillarCardPillar {
  readonly id: string;
  readonly color: string;
  readonly icon: string;
  readonly fields: readonly PillarCardField[];
}

/** Same rule as core's `isAsked`; shared/ui reads the shape only, so it keeps its own copy. */
export function isAsked(field: PillarCardField, values: PillarCardValues): boolean {
  const condition = field.askedWhen;
  if (!condition) return true;
  const value = values[condition.key];
  if ('above' in condition) return typeof value === 'number' && value > condition.above;
  return value === condition.equals;
}
