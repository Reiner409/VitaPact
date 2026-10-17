import type { VitaPactDatabase } from '../database';
import type { Note } from './note';

export type { Note, PlainNote, ProtectedNote } from './note';
export {
  hasNotesPassword,
  openNote,
  removeNotesPassword,
  sealNote,
  setNotesPassword,
  unlockNotes,
  WrongNotePasswordError,
} from './lock';

export async function saveNote(db: VitaPactDatabase, note: Note): Promise<void> {
  await db.notes.put(note);
}

export const getNote = (db: VitaPactDatabase, id: string): Promise<Note | undefined> =>
  db.notes.get(id);

/** Every note, newest date first. */
export const listNotes = (db: VitaPactDatabase): Promise<Note[]> =>
  db.notes.orderBy('date').reverse().toArray();

export async function deleteNote(db: VitaPactDatabase, id: string): Promise<void> {
  await db.notes.delete(id);
}
