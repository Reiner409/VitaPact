import { describe, expect, it } from 'vitest';
import { createWeighIn, weighInStatus, weighInWeekFor } from './index';

const SATURDAY = '2026-10-17';
const SUNDAY = '2026-10-11';
const MONDAY = '2026-10-12';
const TUESDAY = '2026-10-13';
const WEDNESDAY = '2026-10-14';

describe('RF-05 RF-07 which week the weigh-in belongs to', () => {
  it('is the current week on Sunday', () => {
    expect(weighInWeekFor(SUNDAY)).toBe('2026-W41');
  });

  it('is the week just closed from Monday to Saturday', () => {
    expect(weighInWeekFor(MONDAY)).toBe('2026-W41');
    expect(weighInWeekFor(TUESDAY)).toBe('2026-W41');
    expect(weighInWeekFor(WEDNESDAY)).toBe('2026-W41');
    expect(weighInWeekFor(SATURDAY)).toBe('2026-W41');
  });
});

describe('RF-05 RF-06 weigh-in status on Sunday', () => {
  it('asks for the weigh-in when there is none', () => {
    expect(weighInStatus({ today: SUNDAY, recorded: false, postponed: false })).toBe('toAsk');
  });

  it('stays postponed after "Later", so the warning shows', () => {
    expect(weighInStatus({ today: SUNDAY, recorded: false, postponed: true })).toBe('postponed');
  });

  it('is done once the weight is recorded', () => {
    expect(weighInStatus({ today: SUNDAY, recorded: true, postponed: true })).toBe('done');
  });
});

describe('RF-07 D26 D9 catching up the weigh-in', () => {
  it('can be caught up on Monday and Tuesday', () => {
    expect(weighInStatus({ today: MONDAY, recorded: false, postponed: false })).toBe('catchUp');
    expect(weighInStatus({ today: TUESDAY, recorded: false, postponed: true })).toBe('catchUp');
  });

  it('expires from Wednesday on', () => {
    expect(weighInStatus({ today: WEDNESDAY, recorded: false, postponed: false })).toBe('expired');
    expect(weighInStatus({ today: SATURDAY, recorded: false, postponed: true })).toBe('expired');
  });

  it('stays done after Tuesday when it was recorded', () => {
    expect(weighInStatus({ today: WEDNESDAY, recorded: true, postponed: false })).toBe('done');
  });
});

describe('RF-05 RF-07 weigh-in at the end of a 53-week year', () => {
  const noWeighIn = { recorded: false, postponed: false };

  it('asks on Sunday and catches up on Monday and Tuesday for 2026-W53', () => {
    for (const today of ['2027-01-03', '2027-01-04', '2027-01-05']) {
      expect(weighInWeekFor(today)).toBe('2026-W53');
    }
    expect(weighInStatus({ today: '2027-01-03', ...noWeighIn })).toBe('toAsk');
    expect(weighInStatus({ today: '2027-01-04', ...noWeighIn })).toBe('catchUp');
    expect(weighInStatus({ today: '2027-01-05', ...noWeighIn })).toBe('catchUp');
  });

  it('expires on the Wednesday of the new year', () => {
    expect(weighInStatus({ today: '2027-01-06', ...noWeighIn })).toBe('expired');
  });
});

describe('RF-05 RF-07 creating a weigh-in', () => {
  it('links a Sunday weigh-in to its week with the day it was measured', () => {
    expect(createWeighIn({ today: SUNDAY, weightKg: 72.4, fastingConfirmed: true })).toEqual({
      ok: true,
      weighIn: { week: '2026-W41', weightKg: 72.4, measuredOn: SUNDAY, fastingConfirmed: true },
    });
  });

  it('counts a Tuesday catch-up for the previous week, with no late mark', () => {
    const result = createWeighIn({ today: TUESDAY, weightKg: 72.4, fastingConfirmed: true });
    expect(result).toEqual({
      ok: true,
      weighIn: { week: '2026-W41', weightKg: 72.4, measuredOn: TUESDAY, fastingConfirmed: true },
    });
  });

  it('refuses a weigh-in after Tuesday', () => {
    expect(createWeighIn({ today: WEDNESDAY, weightKg: 72.4, fastingConfirmed: true })).toEqual({
      ok: false,
      error: 'expired',
    });
  });

  it('requires the "on an empty stomach" confirmation', () => {
    expect(createWeighIn({ today: SUNDAY, weightKg: 72.4, fastingConfirmed: false })).toEqual({
      ok: false,
      error: 'fastingNotConfirmed',
    });
  });

  it('accepts a weight with one decimal place', () => {
    expect(createWeighIn({ today: SUNDAY, weightKg: 80, fastingConfirmed: true }).ok).toBe(true);
    expect(createWeighIn({ today: SUNDAY, weightKg: 80.1, fastingConfirmed: true }).ok).toBe(true);
  });

  it.each([72.45, 0, -70, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects %s kg as a weight',
    (weightKg) => {
      expect(createWeighIn({ today: SUNDAY, weightKg, fastingConfirmed: true })).toEqual({
        ok: false,
        error: 'invalidWeight',
      });
    },
  );
});
