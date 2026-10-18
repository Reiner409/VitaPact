import type { IsoDate } from '@vitapact/core/storage';
import type { PlainNote } from '@vitapact/core/storage/notes';
import { useTranslation } from '@vitapact/i18n';
import {
  Banner,
  Button,
  EmptyState,
  PageHeader,
  SplitView,
  Stack,
  Toast,
  useSplitLayout,
} from '@vitapact/ui';
import { useState, type ReactNode } from 'react';
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
  /** The padlock actions, shown next to "New note" on the list. */
  lockActions?: ReactNode;
}

const systemClock: NoteboardClock = {
  now: () => new Date(),
  newId: () => crypto.randomUUID(),
};

/** The list and the open note side by side on a wide window, one at a time on a narrow one (RF-29). */
export function Noteboard({ store, clock = systemClock, lockActions }: NoteboardProps) {
  const { t } = useTranslation('noteboard');
  const board = useNoteboard(store, clock);
  const { failure } = board;
  const editing = board.view.kind !== 'list';

  return (
    <>
      <NoteboardHeader
        openDate={editing ? board.openDate() : undefined}
        onCreate={board.create}
        lockActions={lockActions}
      />
      <Banner tone="info" icon="info">
        {t('privacy')}
      </Banner>
      {board.notes && <NotesAndOpenNote board={board} notes={board.notes} />}
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

/** The searchable list of notes and, beside it or in its place, the open note. */
function NotesAndOpenNote({ board, notes }: { board: Board; notes: PlainNote[] }) {
  const [filter, setFilter] = useState(noFilter);
  return (
    <SplitView
      list={
        <NoteList
          notes={notes}
          filter={filter}
          onFilterChange={setFilter}
          onCreate={board.create}
          onOpen={board.open}
        />
      }
      detail={board.view.kind === 'list' ? undefined : <OpenNote board={board} />}
      placeholder={notes.length > 0 ? <NoNoteOpen /> : undefined}
    />
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

/** Beside the list on a wide window while no note is open. */
function NoNoteOpen() {
  const { t } = useTranslation('noteboard');
  return (
    <EmptyState icon="noteboard" title={t('pick.title')} description={t('pick.description')} />
  );
}

/** The open note's date under the title while editing; the "New note" action wherever the list shows. */
function NoteboardHeader({
  openDate,
  onCreate,
  lockActions,
}: {
  openDate: IsoDate | undefined;
  onCreate: () => void;
  lockActions: ReactNode;
}) {
  const { t, i18n } = useTranslation('noteboard');
  const listShown = useSplitLayout() || !openDate;
  return (
    <PageHeader
      title={t('title')}
      {...(openDate && { subtitle: formatNoteDate(openDate, i18n.language) })}
      action={
        listShown && (
          <Stack horizontal gap="tight">
            <Button onClick={onCreate}>{t('actions.new')}</Button>
            {lockActions}
          </Stack>
        )
      }
    />
  );
}
