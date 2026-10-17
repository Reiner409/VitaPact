import { act, renderHook, waitFor } from '@testing-library/react';
import { saveDailyEntry } from '@vitapact/core/storage';
import { openTestDatabase, sampleEntry } from '@vitapact/core/storage/testing';
import { describe, expect, it } from 'vitest';
import { useDayValues } from './useDayValues';

describe('F3-TD-06 useDayValues', () => {
  it('RF-03 loads what was saved for the day', async () => {
    const db = await openTestDatabase();
    await saveDailyEntry(db, sampleEntry);
    const { result } = renderHook(() => useDayValues(db, sampleEntry.date));
    await waitFor(() => expect(result.current.values).toEqual(sampleEntry.pillars));
    expect(result.current.changed).toBe(false);
  });

  it('RF-03 keeps an answer given while the saved day is still loading', async () => {
    const db = await openTestDatabase();
    await saveDailyEntry(db, sampleEntry);
    const { result } = renderHook(() => useDayValues(db, sampleEntry.date));
    act(() => result.current.setField('food', 'rating', 5));
    await db.dailyEntries.get(sampleEntry.date);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(result.current.values).toEqual({ food: { rating: 5 } });
    expect(result.current.changed).toBe(true);
  });
});
