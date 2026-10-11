import { describe, expect, it } from 'vitest';
import { sourceCoversRequirement, uncoveredRequirements } from './matrix';

describe('RNF-14 traceability matrix check', () => {
  it('finds an id in a describe title', () => {
    expect(sourceCoversRequirement(`describe('RF-03 daily check-in', () => {})`, 'RF-03')).toBe(
      true,
    );
  });

  it('finds an id in an it or test title', () => {
    expect(sourceCoversRequirement(`it("saves sleep (RF-03)", () => {})`, 'RF-03')).toBe(true);
    expect(sourceCoversRequirement('test(`RNF-01 blocks fetch`, async () => {})', 'RNF-01')).toBe(
      true,
    );
  });

  it('does not confuse RF-1 with RF-10 or RNF-01 with RF-01', () => {
    expect(sourceCoversRequirement(`describe('RF-10 report', () => {})`, 'RF-1')).toBe(false);
    expect(sourceCoversRequirement(`describe('RNF-01 offline', () => {})`, 'RF-01')).toBe(false);
  });

  it('ignores ids that appear outside test titles', () => {
    expect(sourceCoversRequirement(`// RF-03 is covered elsewhere`, 'RF-03')).toBe(false);
  });

  it('lists matrix entries no test mentions', () => {
    const entries = [
      { id: 'RF-01', tasks: ['F2-04'] },
      { id: 'RF-02', tasks: ['F2-04'] },
    ];
    expect(uncoveredRequirements(entries, [`describe('RF-01 profile', () => {})`])).toEqual([
      'RF-02',
    ]);
  });
});
