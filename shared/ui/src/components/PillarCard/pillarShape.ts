/**
 * The part of a pillar module (core `Pillar`, F2-05) that PillarCard reads. Core pillars fit
 * it as they are, so screens pass `pillarRegistry.list()` items straight in (RF-23).
 */
export type PillarFieldValue = number | boolean | string;

export type PillarCardValues = Readonly<Record<string, PillarFieldValue | undefined>>;

interface FieldBase {
  readonly key: string;
  /** The field is asked only while another field holds this value. */
  readonly askedWhen?: { readonly key: string; readonly equals: PillarFieldValue };
}

export type PillarCardField = FieldBase &
  (
    | {
        readonly kind: 'number';
        readonly unit: string;
        readonly min: number;
        readonly max: number;
        readonly step: number;
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

export const isAsked = (field: PillarCardField, values: PillarCardValues) =>
  !field.askedWhen || values[field.askedWhen.key] === field.askedWhen.equals;
