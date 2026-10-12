import type { VitaPactDatabase } from '@vitapact/core/storage';
import { deleteNote, listNotes, saveNote, type Note } from '@vitapact/core/storage/notes';

/** The few storage calls the Noteboard needs, so its views can be tested without a database. */
export interface NotesStore {
  list: () => Promise<Note[]>;
  save: (note: Note) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function notesStoreOf(db: VitaPactDatabase): NotesStore {
  return {
    list: () => listNotes(db),
    save: (note) => saveNote(db, note),
    remove: (id) => deleteNote(db, id),
  };
}
