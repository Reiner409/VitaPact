import type { IsoDate } from '@vitapact/core/storage';
import { useTranslation } from '@vitapact/i18n';
import { Button, PageHeader, Toast } from '@vitapact/ui';
import { NoteEditor } from './NoteEditor';
import { NoteList } from './NoteList';
import { formatNoteDate } from './notes/formatNoteDate';
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
  const { view, notes, failure } = board;
  const editing = view.kind !== 'list';

  return (
    <>
      <NoteboardHeader openDate={editing ? board.openDate() : undefined} onCreate={board.create} />
      {!editing && notes && <NoteList notes={notes} onCreate={board.create} onOpen={board.open} />}
      {editing && (
        <NoteEditor
          key={view.kind === 'edit' ? view.note.id : 'new'}
          initial={view.kind === 'edit' ? draftOf(view.note) : emptyDraft}
          onSave={(draft) => void board.saveDraft(draft)}
          onClose={board.close}
          {...(view.kind === 'edit' && { onDelete: () => void board.removeOpen() })}
        />
      )}
      <Toast
        opened={failure !== undefined}
        tone="error"
        message={failure === 'delete' ? t('errors.delete') : t('errors.save')}
        closeLabel={t('errors.close')}
        onClose={board.dismissFailure}
      />
    </>
  );
}

/** The open note's date under the title while editing; the "New note" action on the list. */
function NoteboardHeader({
  openDate,
  onCreate,
}: {
  openDate: IsoDate | undefined;
  onCreate: () => void;
}) {
  const { t, i18n } = useTranslation('noteboard');
  if (openDate) {
    return <PageHeader title={t('title')} subtitle={formatNoteDate(openDate, i18n.language)} />;
  }
  return (
    <PageHeader
      title={t('title')}
      action={<Button onClick={onCreate}>{t('actions.new')}</Button>}
    />
  );
}
