import type { PlainNote } from '@vitapact/core/storage/notes';
import { describe, expect, it } from 'vitest';
import { newestFirst } from './newestFirst';

const note = (id: string, date: string, createdAt: string): PlainNote => ({
  id,
  kind: 'plain',
  title: id,
  body: '',
  tag: '',
  date,
  createdAt,
  updatedAt: createdAt,
});

describe('RF-17 notes newest first', () => {
  it('puts the latest day first and, within a day, the note written last', () => {
    const morning = note('b-morning', '2026-10-12', '2026-10-12T08:00:00.000Z');
    const evening = note('a-evening', '2026-10-12', '2026-10-12T20:00:00.000Z');
    const yesterday = note('c-yesterday', '2026-10-11', '2026-10-11T22:00:00.000Z');
    expect(newestFirst([morning, yesterday, evening]).map(({ id }) => id)).toEqual([
      'a-evening',
      'b-morning',
      'c-yesterday',
    ]);
  });
});
