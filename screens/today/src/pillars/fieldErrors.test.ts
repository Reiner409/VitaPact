import { sleepPillar, sunPillar, trainingPillar } from '@vitapact/core/pillars';
import { describe, expect, it } from 'vitest';
import { liveErrorsOf } from './fieldErrors';

describe('F3-TD-02 F3-TD-05 errors shown while typing', () => {
  it('RF-03 flags sleep hours that are not in steps of 0.5', () => {
    expect(liveErrorsOf(sleepPillar, { hours: 7.3 })).toEqual(new Map([['hours', 'step']]));
  });

  it('RF-03 flags minutes in the sun beyond a whole day', () => {
    expect(liveErrorsOf(sunPillar, { minutes: 2000 })).toEqual(new Map([['minutes', 'range']]));
  });

  it('waits for the save to report fields left empty', () => {
    expect(liveErrorsOf(trainingPillar, { trained: true })).toEqual(new Map());
  });
});
