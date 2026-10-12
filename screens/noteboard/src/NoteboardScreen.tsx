import type { VitaPactDatabase } from '@vitapact/core/storage';
import { useMemo } from 'react';
import { Noteboard } from './Noteboard';
import { notesStoreOf } from './notes/notesStore';

export interface NoteboardScreenProps {
  db: VitaPactDatabase;
}

export function NoteboardScreen({ db }: NoteboardScreenProps) {
  const store = useMemo(() => notesStoreOf(db), [db]);
  return <Noteboard store={store} />;
}
