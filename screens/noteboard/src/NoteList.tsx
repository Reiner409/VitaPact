import type { PlainNote } from '@vitapact/core/storage/notes';
import { useTranslation } from '@vitapact/i18n';
import { Badge, Card, ChipGroup, EmptyState, Stack, TextField } from '@vitapact/ui';
import { formatNoteDate } from './notes/formatNoteDate';
import { filterNotes, usedTags, type NoteFilter } from './notes/searchNotes';

export interface NoteListProps {
  notes: PlainNote[];
  filter: NoteFilter;
  onFilterChange: (filter: NoteFilter) => void;
  onOpen: (note: PlainNote) => void;
  onCreate: () => void;
}

export function NoteList({ notes, filter, onFilterChange, onOpen, onCreate }: NoteListProps) {
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
    <Stack>
      <NoteFilters tags={usedTags(notes)} filter={filter} onChange={onFilterChange} />
      <FoundNotes notes={filterNotes(notes, filter)} onOpen={onOpen} />
    </Stack>
  );
}

function NoteFilters({
  tags,
  filter,
  onChange,
}: {
  tags: string[];
  filter: NoteFilter;
  onChange: (filter: NoteFilter) => void;
}) {
  const { t } = useTranslation('noteboard');
  const options = [
    { value: '', label: t('filter.all') },
    ...tags.map((tag) => ({ value: tag, label: tag })),
  ];
  return (
    <>
      <TextField
        label={t('search.label')}
        value={filter.query}
        onChange={(query) => onChange({ ...filter, query })}
      />
      {tags.length > 0 && (
        <ChipGroup
          label={t('filter.label')}
          options={options}
          value={filter.tag}
          onChange={(tag) => onChange({ ...filter, tag })}
        />
      )}
    </>
  );
}

function FoundNotes({ notes, onOpen }: { notes: PlainNote[]; onOpen: (note: PlainNote) => void }) {
  const { t } = useTranslation('noteboard');
  if (notes.length === 0) {
    return (
      <EmptyState
        icon="noteboard"
        title={t('noMatch.title')}
        description={t('noMatch.description')}
      />
    );
  }
  return (
    <section aria-label={t('list.label')}>
      <Stack gap="tight">
        {notes.map((note) => (
          <NoteRow key={note.id} note={note} onOpen={onOpen} />
        ))}
      </Stack>
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
