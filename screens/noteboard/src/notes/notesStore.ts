import type { VitaPactDatabase } from '@vitapact/core/storage';
import {
  deleteNote,
  listNotes,
  openNote,
  saveNote,
  sealNote,
  type Note,
} from '@vitapact/core/storage/notes';

/** The few storage calls the Noteboard needs, so its views can be tested without a database. */
export interface NotesStore {
  list: () => Promise<Note[]>;
  save: (note: Note) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

/**
 * With the Noteboard key the store opens every note it lists and seals every note it saves, so
 * the views only ever see plain notes and the disk only ever sees sealed ones (RF-18).
 */
export function notesStoreOf(db: VitaPactDatabase, key?: CryptoKey): NotesStore {
  if (!key) {
    return {
      list: () => listNotes(db),
      save: (note) => saveNote(db, note),
      remove: (id) => deleteNote(db, id),
    };
  }
  return {
    list: async () => Promise.all((await listNotes(db)).map((note) => openNote(note, key))),
    save: async (note) => saveNote(db, note.kind === 'plain' ? await sealNote(note, key) : note),
    remove: (id) => deleteNote(db, id),
  };
}
