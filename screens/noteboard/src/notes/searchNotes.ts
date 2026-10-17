import type { PlainNote } from '@vitapact/core/storage/notes';

export interface NoteFilter {
  /** Free text looked up in the title and the text. */
  query: string;
  /** A tag from `usedTags`, or empty for every tag. */
  tag: string;
}

export const noFilter: NoteFilter = { query: '', tag: '' };

/** Lower case without accents, so "Perché" and "perche" match (F3-NB-02). */
const folded = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase();

const sameTag = (a: string, b: string) => folded(a) === folded(b);

export function filterNotes(notes: readonly PlainNote[], { query, tag }: NoteFilter): PlainNote[] {
  const wanted = folded(query.trim());
  return notes.filter(
    (note) =>
      (tag === '' || sameTag(note.tag, tag)) &&
      (folded(note.title).includes(wanted) || folded(note.body).includes(wanted)),
  );
}

/** Every tag in use, spelled as in the first note that has it, so the editor can suggest it (D32). */
export function usedTags(notes: readonly PlainNote[]): string[] {
  const byFolded = new Map<string, string>();
  for (const { tag } of notes) {
    if (tag !== '' && !byFolded.has(folded(tag))) byFolded.set(folded(tag), tag);
  }
  return [...byFolded.values()].sort((a, b) => a.localeCompare(b));
}
