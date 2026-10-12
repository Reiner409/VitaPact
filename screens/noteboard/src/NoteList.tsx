import type { PlainNote } from '@vitapact/core/storage/notes';
import { useTranslation } from '@vitapact/i18n';
import { Badge, Card, EmptyState } from '@vitapact/ui';
import { formatNoteDate } from './notes/formatNoteDate';

export interface NoteListProps {
  notes: PlainNote[];
  onOpen: (note: PlainNote) => void;
  onCreate: () => void;
}

export function NoteList({ notes, onOpen, onCreate }: NoteListProps) {
  const { t } = useTranslation('noteboard');
  if (notes.length === 0) {
    return (
      <EmptyState
        icon="noteboard"
        title={t('empty.title')}
        description={t('empty.description')}
        action={{ label: t('actions.new'), onClick: onCreate }}
      />
    );
  }
  return (
    <section aria-label={t('list.label')}>
      {notes.map((note) => (
        <NoteRow key={note.id} note={note} onOpen={onOpen} />
      ))}
    </section>
  );
}

function NoteRow({ note, onOpen }: { note: PlainNote; onOpen: (note: PlainNote) => void }) {
  const { t, i18n } = useTranslation('noteboard');
  return (
    <Card onClick={() => onOpen(note)}>
      {t('list.summary', {
        title: note.title || t('list.untitled'),
        date: formatNoteDate(note.date, i18n.language),
      })}
      {note.tag && <Badge variant="neutral">{note.tag}</Badge>}
    </Card>
  );
}
