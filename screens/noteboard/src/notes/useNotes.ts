import type { Note, PlainNote } from '@vitapact/core/storage/notes';
import { useCallback, useEffect, useState } from 'react';
import { newestFirst } from './newestFirst';
import type { NotesStore } from './notesStore';

const plainNotes = async (store: NotesStore) =>
  newestFirst(
    (await store.list()).filter((note: Note): note is PlainNote => note.kind === 'plain'),
  );

/** The plain notes in the store, newest date first, and the calls that change them. */
export function useNotes(store: NotesStore) {
  const [notes, setNotes] = useState<PlainNote[] | undefined>(undefined);

  useEffect(() => {
    let current = true;
    void plainNotes(store).then((loaded) => current && setNotes(loaded));
    return () => {
      current = false;
    };
  }, [store]);

  const save = useCallback(
    async (note: PlainNote) => {
      await store.save(note);
      setNotes(await plainNotes(store));
    },
    [store],
  );

  const remove = useCallback(
    async (id: string) => {
      await store.remove(id);
      setNotes(await plainNotes(store));
    },
    [store],
  );

  return { notes, save, remove };
}
