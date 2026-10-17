export type FieldValue = number | boolean | string;

/** The values a user logged for one pillar on one day, keyed by field. */
export type PillarValues = Readonly<Record<string, FieldValue | undefined>>;

/** One day's check-in, keyed by pillar id: a new pillar adds a key, never a column (RF-23). */
export type DayValues = Readonly<Record<string, PillarValues | undefined>>;

/** Goals per pillar id, e.g. `{ sleep: 7.5, training: 3, food: 4, sun: 20 }`. */
export type Goals = Readonly<Record<string, number>>;

/**
 * A field is asked only while another field of the same pillar holds the given value, or a
 * number above the given one (sleep quality needs some hours of sleep).
 */
export type FieldCondition =
  | { readonly key: string; readonly equals: FieldValue }
  | { readonly key: string; readonly above: number };

interface FieldBase {
  readonly key: string;
  readonly askedWhen?: FieldCondition;
}

export interface NumberField extends FieldBase {
  readonly kind: 'number';
  readonly unit: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  /** Common values offered as one-tap buttons, e.g. 10/20/30/60 minutes of sun. */
  readonly quickValues?: readonly number[];
}

/** A whole-number rating such as 1-5 stars. */
export interface ScaleField extends FieldBase {
  readonly kind: 'scale';
  readonly min: number;
  readonly max: number;
}

export interface YesNoField extends FieldBase {
  readonly kind: 'yesNo';
}

export interface ChoiceField extends FieldBase {
  readonly kind: 'choice';
  readonly options: readonly string[];
}

export type PillarField = NumberField | ScaleField | YesNoField | ChoiceField;

/**
 * `daily`: the goal is met or missed each day (hours of sleep).
 * `weekly`: the goal counts days per week (workouts), so a day without one costs nothing on its own.
 */
export type GoalCadence = 'daily' | 'weekly';

export interface PillarGoal {
  readonly cadence: GoalCadence;
  readonly default: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  /** False when the goal is fixed by the rules rather than chosen by the user. */
  readonly editable: boolean;
}

export interface Pillar {
  readonly id: string;
  /** Name of the pillar colour in the design system tokens. */
  readonly color: string;
  /** Name of the pillar icon in the design system. */
  readonly icon: string;
  readonly fields: readonly PillarField[];
  /** The field that weekly statistics average. */
  readonly summaryField: string;
  readonly goal: PillarGoal;
  isOnGoal(values: PillarValues, goal: number): boolean;
  /**
   * How much of the day's goal was reached, from 0 to 1, for the day score (RF-09). Without it
   * the day counts as 1 on goal and 0 otherwise.
   */
  dayProgress?(values: PillarValues, goal: number): number;
}

export type FieldErrorCode = 'required' | 'type' | 'range' | 'step' | 'option' | 'unexpected';

export interface FieldError {
  readonly field: string;
  readonly code: FieldErrorCode;
}

export interface DayError {
  readonly pillar: string;
  readonly field?: string;
  readonly code: FieldErrorCode | 'unknown-pillar';
}
