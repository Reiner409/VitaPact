import {
  createNoteLock,
  protectNote,
  revealNote,
  unlockNoteKey,
  type PlainNote as OpenNote,
} from '../../crypto/notes';
import type { VitaPactDatabase } from '../database';
import { getProfile } from '../profile';
import type { Profile } from '../records';
import type { Note, PlainNote, ProtectedNote } from './note';

export { WrongNotePasswordError } from '../../crypto/notes';

const toOpen = ({ kind: _kind, ...note }: PlainNote): OpenNote => note;

const toSealed = ({ kind: _kind, ...sealed }: ProtectedNote) => sealed;

const withoutLock = ({ noteLock: _noteLock, ...profile }: Profile): Profile => profile;

const toPlain = (note: OpenNote): PlainNote => ({ ...note, kind: 'plain', tag: note.tag ?? '' });

/** Seals one note with the Noteboard key, e.g. a note written while the board is unlocked. */
export async function sealNote(note: PlainNote, key: CryptoKey): Promise<ProtectedNote> {
  return { ...(await protectNote(toOpen(note), key)), kind: 'protected' };
}

/** Opens one protected note; a plain one is returned as it is. */
export async function openNote(note: Note, key: CryptoKey): Promise<PlainNote> {
  if (note.kind === 'plain') return note;
  return toPlain(await revealNote(toSealed(note), key));
}

/** True while the Noteboard has a password (RF-18). */
export const hasNotesPassword = async (db: VitaPactDatabase) =>
  (await getProfile(db))?.noteLock !== undefined;

/**
 * RF-18: sets the Noteboard password and seals every note with it. The sealing happens first and
 * the notes and the lock are written in one transaction, so a failure leaves all notes plain.
 * Returns the key, kept only in memory while the board stays unlocked.
 */
export async function setNotesPassword(db: VitaPactDatabase, password: string): Promise<CryptoKey> {
  const profile = await getProfile(db);
  if (!profile) throw new Error('There is no profile to keep the notes lock in');
  if (profile.noteLock) throw new Error('The notes already have a password');
  const { lock, key } = await createNoteLock(password);
  const notes = await db.notes.toArray();
  const sealed = await Promise.all(
    notes.map((note) => (note.kind === 'plain' ? sealNote(note, key) : note)),
  );
  await db.transaction('rw', db.profile, db.notes, async () => {
    await db.notes.bulkPut(sealed);
    await db.profile.put({ ...profile, noteLock: lock });
  });
  return key;
}

/** RF-18: the key for the stored lock; a wrong password throws WrongNotePasswordError. */
export async function unlockNotes(db: VitaPactDatabase, password: string): Promise<CryptoKey> {
  const lock = (await getProfile(db))?.noteLock;
  if (!lock) throw new Error('The notes have no password');
  return unlockNoteKey(password, lock);
}

/** RF-18: opens every note for good and removes the lock, in one transaction. */
export async function removeNotesPassword(db: VitaPactDatabase, password: string): Promise<void> {
  const key = await unlockNotes(db, password);
  const profile = await getProfile(db);
  if (!profile) return;
  const opened = await Promise.all((await db.notes.toArray()).map((note) => openNote(note, key)));
  await db.transaction('rw', db.profile, db.notes, async () => {
    await db.notes.bulkPut(opened);
    await db.profile.put(withoutLock(profile));
  });
}
