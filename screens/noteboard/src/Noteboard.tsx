import type { IsoDate } from '@vitapact/core/storage';
import { useTranslation } from '@vitapact/i18n';
import { Banner, Button, PageHeader, Toast } from '@vitapact/ui';
import { useState } from 'react';
import { NoteEditor } from './NoteEditor';
import { NoteList } from './NoteList';
import { formatNoteDate } from './notes/formatNoteDate';
import { draftOf, emptyDraft } from './notes/noteDraft';
import { noFilter, usedTags } from './notes/searchNotes';
import type { NotesStore } from './notes/notesStore';
import { useNoteboard, type NoteboardClock } from './notes/useNoteboard';

type Board = ReturnType<typeof useNoteboard>;

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
  const [filter, setFilter] = useState(noFilter);

  return (
    <>
      <NoteboardHeader openDate={editing ? board.openDate() : undefined} onCreate={board.create} />
      <Banner tone="info" icon="info">
        {t('privacy')}
      </Banner>
      {!editing && notes && (
        <NoteList
          notes={notes}
          filter={filter}
          onFilterChange={setFilter}
          onCreate={board.create}
          onOpen={board.open}
        />
      )}
      {editing && <OpenNote board={board} />}
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

/** The editor of the open note, or of a new one, with the tags of the saved notes to choose from. */
function OpenNote({ board }: { board: Board }) {
  const { view } = board;
  const note = view.kind === 'edit' ? view.note : undefined;
  return (
    <NoteEditor
      key={note?.id ?? 'new'}
      initial={note ? draftOf(note) : emptyDraft}
      tagSuggestions={usedTags(board.notes ?? [])}
      onSave={(draft) => void board.saveDraft(draft)}
      onClose={board.close}
      {...(note && { onDelete: () => void board.removeOpen() })}
    />
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
