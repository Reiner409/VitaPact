import { useTranslation } from '@vitapact/i18n';
import { Button, PageHeader } from '@vitapact/ui';
import { NoteEditor } from './NoteEditor';
import { NoteList } from './NoteList';
import { draftOf, emptyDraft } from './notes/noteDraft';
import type { NotesStore } from './notes/notesStore';
import { useNoteboard, type NoteboardClock } from './notes/useNoteboard';

export interface NoteboardProps {
  store: NotesStore;
  clock?: NoteboardClock;
}

const systemClock: NoteboardClock = {
  now: () => new Date(),
  newId: () => crypto.randomUUID(),
};

/** One column at a time: the list, or the editor of one note (RF-29). */
export function Noteboard({ store, clock = systemClock }: NoteboardProps) {
  const { t } = useTranslation('noteboard');
  const board = useNoteboard(store, clock);
  const { view, notes } = board;
  const newNote = <Button onClick={board.create}>{t('actions.new')}</Button>;

  return (
    <>
      <PageHeader title={t('title')} action={view.kind === 'list' ? newNote : undefined} />
      {view.kind === 'list' && notes && (
        <NoteList notes={notes} onCreate={board.create} onOpen={board.open} />
      )}
      {view.kind !== 'list' && (
        <NoteEditor
          key={view.kind === 'edit' ? view.note.id : 'new'}
          initial={view.kind === 'edit' ? draftOf(view.note) : emptyDraft}
          onSave={(draft) => void board.saveDraft(draft)}
          onClose={board.close}
          {...(view.kind === 'edit' && { onDelete: () => void board.removeOpen() })}
        />
      )}
    </>
  );
}
