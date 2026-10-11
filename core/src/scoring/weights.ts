/**
 * The score weights (D8). This file is the single place to change them (RF-09): every score is
 * the weighted share of what was achieved, so the weights need not add up to 100.
 * A pillar without a weight here does not count towards the score.
 */
export const scoreWeights: ScoreWeights = {
  logging: 15,
  weighIn: 5,
  pillars: { sleep: 25, training: 25, food: 20, sun: 10 },
};

export interface ScoreWeights {
  /** Days logged out of 7. */
  readonly logging: number;
  /** Sunday weigh-in done; never part of the daily score. */
  readonly weighIn: number;
  readonly pillars: Readonly<Record<string, number>>;
}
