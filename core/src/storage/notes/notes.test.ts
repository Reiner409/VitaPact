import { describe, expect, it } from 'vitest';
import { openTestDatabase, sampleNote } from '../testing';
import { deleteNote, getNote, listNotes, saveNote, type ProtectedNote } from './index';

describe('RNF-11 notes table', () => {
  it('reads back, updates and deletes a note', async () => {
    const db = await openTestDatabase();
    const edited = { ...sampleNote, body: 'And about training.' };

    await saveNote(db, sampleNote);
    await saveNote(db, edited);
    expect(await getNote(db, sampleNote.id)).toEqual(edited);

    await deleteNote(db, sampleNote.id);
    expect(await getNote(db, sampleNote.id)).toBeUndefined();
  });

  it('lists notes newest date first', async () => {
    const db = await openTestDatabase();
    await saveNote(db, sampleNote);
    await saveNote(db, { ...sampleNote, id: 'note-2', date: '2026-10-10' });

    expect((await listNotes(db)).map(({ id }) => id)).toEqual(['note-2', 'note-1']);
  });

  it('RF-18 stores a protected note as ciphertext and IV only', async () => {
    const db = await openTestDatabase();
    const { id, date, createdAt, updatedAt } = sampleNote;
    const locked: ProtectedNote = {
      id,
      date,
      createdAt,
      updatedAt,
      kind: 'protected',
      ciphertext: 'c2VjcmV0',
      iv: 'aXY=',
    };

    await saveNote(db, locked);

    expect(await getNote(db, id)).toEqual(locked);
  });
});
