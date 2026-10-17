import { describe, expect, it } from 'vitest';
import { getProfile, saveProfile } from '../profile';
import { openTestDatabase, sampleNote as anyNote, sampleProfile } from '../testing';
import {
  hasNotesPassword,
  listNotes,
  openNote,
  removeNotesPassword,
  saveNote,
  sealNote,
  setNotesPassword,
  unlockNotes,
  WrongNotePasswordError,
  type PlainNote,
} from './index';

const sampleNote = anyNote as PlainNote;

const password = 'correct horse battery staple';
const second = { ...sampleNote, id: 'note-2', title: 'Second', body: 'Gym at seven', tag: '' };

async function seeded() {
  const db = await openTestDatabase();
  await saveProfile(db, sampleProfile);
  await saveNote(db, sampleNote);
  await saveNote(db, second);
  return db;
}

describe('F3-NB-04 RF-18 RNF-04 setting the Noteboard password', () => {
  it('seals every note and keeps no text, key or password in the database', async () => {
    const db = await seeded();
    const key = await setNotesPassword(db, password);
    expect(await hasNotesPassword(db)).toBe(true);
    const stored = await listNotes(db);
    expect(stored.every((note) => note.kind === 'protected')).toBe(true);
    const dump = JSON.stringify({ notes: stored, profile: await getProfile(db) });
    for (const secret of [sampleNote.title, sampleNote.body, second.body, password]) {
      expect(dump).not.toContain(secret);
    }
    const opened = await Promise.all(stored.map((note) => openNote(note, key)));
    expect(opened).toEqual(expect.arrayContaining([sampleNote, second]));
  });

  it('refuses a second password while one is set', async () => {
    const db = await seeded();
    await setNotesPassword(db, password);
    await expect(setNotesPassword(db, 'another')).rejects.toThrow();
  });

  it('keeps the lock when the profile is saved from settings afterwards', async () => {
    const db = await seeded();
    const before = await getProfile(db);
    await setNotesPassword(db, password);
    await saveProfile(db, { ...sampleProfile, ...before, nickname: 'Sam' });
    expect(await hasNotesPassword(db)).toBe(true);
  });
});

describe('F3-NB-05 RF-18 unlocking the Noteboard', () => {
  it('gives the key for the right password and opens a note written while unlocked', async () => {
    const db = await seeded();
    await setNotesPassword(db, password);
    const key = await unlockNotes(db, password);
    const written = { ...sampleNote, id: 'note-3', body: 'Written while unlocked' };
    await saveNote(db, await sealNote(written, key));
    const stored = (await listNotes(db)).find((note) => note.id === 'note-3');
    expect(stored?.kind).toBe('protected');
    expect(stored && (await openNote(stored, key))).toEqual(written);
  });

  it('rejects a wrong password', async () => {
    const db = await seeded();
    await setNotesPassword(db, password);
    await expect(unlockNotes(db, 'wrong')).rejects.toBeInstanceOf(WrongNotePasswordError);
  });
});

describe('F3-NB-06 RF-18 removing the Noteboard password', () => {
  it('puts every note back in plain text and removes the lock', async () => {
    const db = await seeded();
    await setNotesPassword(db, password);
    await removeNotesPassword(db, password);
    expect(await hasNotesPassword(db)).toBe(false);
    expect(await listNotes(db)).toEqual(expect.arrayContaining([sampleNote, second]));
  });

  it('needs the current password and changes nothing without it', async () => {
    const db = await seeded();
    await setNotesPassword(db, password);
    await expect(removeNotesPassword(db, 'wrong')).rejects.toBeInstanceOf(WrongNotePasswordError);
    expect(await hasNotesPassword(db)).toBe(true);
    expect((await listNotes(db)).every((note) => note.kind === 'protected')).toBe(true);
  });
});
