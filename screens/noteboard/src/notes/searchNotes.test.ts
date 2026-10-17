import type { PlainNote } from '@vitapact/core/storage/notes';
import { describe, expect, it } from 'vitest';
import { filterNotes, usedTags } from './searchNotes';

const note = (id: string, title: string, body: string, tag: string): PlainNote => ({
  id,
  kind: 'plain',
  title,
  body,
  tag,
  date: '2026-10-12',
  createdAt: '2026-10-12T08:00:00.000Z',
  updatedAt: '2026-10-12T08:00:00.000Z',
});

const session = note('session', 'Seduta', 'Abbiamo parlato di perché dormo poco.', 'Psicologa');
const walk = note('walk', 'Long walk', 'Two hours by the river.', 'Activity');
const untagged = note('plain', 'Groceries', 'Eggs, rice.', '');
const notes = [session, walk, untagged];
const ids = (found: PlainNote[]) => found.map(({ id }) => id);

describe('RF-17 Noteboard search', () => {
  it('finds a word in the title or in the text, ignoring case', () => {
    expect(ids(filterNotes(notes, { query: 'LONG', tag: '' }))).toEqual(['walk']);
    expect(ids(filterNotes(notes, { query: 'river', tag: '' }))).toEqual(['walk']);
  });

  it('ignores accents on both sides', () => {
    expect(ids(filterNotes(notes, { query: 'perche', tag: '' }))).toEqual(['session']);
    expect(
      ids(filterNotes([walk, note('cafe', 'Café', '', '')], { query: 'cafè', tag: '' })),
    ).toEqual(['cafe']);
  });

  it('keeps every note when the search is blank', () => {
    expect(ids(filterNotes(notes, { query: '  ', tag: '' }))).toEqual(['session', 'walk', 'plain']);
  });

  it('filters by tag and combines the tag with the search', () => {
    expect(ids(filterNotes(notes, { query: '', tag: 'Activity' }))).toEqual(['walk']);
    expect(ids(filterNotes(notes, { query: 'river', tag: 'Psicologa' }))).toEqual([]);
  });
});

describe('RF-17 Noteboard tag suggestions', () => {
  it('lists each tag already used once, in alphabetical order, without blanks', () => {
    const again = note('again', 'Second session', '', 'psicologa');
    expect(usedTags([...notes, again])).toEqual(['Activity', 'Psicologa']);
  });
});
