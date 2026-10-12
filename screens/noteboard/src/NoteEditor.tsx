import { useTranslation } from '@vitapact/i18n';
import { Button, ConfirmDialog, TextArea, TextField } from '@vitapact/ui';
import { useState } from 'react';
import { NOTE_LIMITS, canSave, type NoteDraft } from './notes/noteDraft';

export interface NoteEditorProps {
  initial: NoteDraft;
  onSave: (draft: NoteDraft) => void;
  onClose: () => void;
  /** Present only for a note that is already saved. */
  onDelete?: () => void;
}

export function NoteEditor({ initial, onSave, onClose, onDelete }: NoteEditorProps) {
  const { t } = useTranslation('noteboard');
  const [draft, setDraft] = useState(initial);
  const counter = (length: number, max: number) => t('editor.counter', { length, max });
  const field = (name: keyof NoteDraft) => ({
    value: draft[name],
    onChange: (value: string) => setDraft({ ...draft, [name]: value }),
    maxLength: NOTE_LIMITS[name],
  });

  return (
    <section aria-label={t('editor.label')}>
      <TextField label={t('editor.title')} {...field('title')} formatCounter={counter} />
      <TextArea label={t('editor.body')} {...field('body')} />
      <TextField label={t('editor.tag')} {...field('tag')} description={t('editor.tagHint')} />
      <Button disabled={!canSave(draft)} onClick={() => onSave(draft)}>
        {t('actions.save')}
      </Button>
      <Button variant="secondary" onClick={onClose}>
        {t('actions.back')}
      </Button>
      {onDelete && <DeleteNote onDelete={onDelete} />}
    </section>
  );
}

function DeleteNote({ onDelete }: { onDelete: () => void }) {
  const { t } = useTranslation('noteboard');
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <Button variant="destructive" onClick={() => setConfirming(true)}>
        {t('actions.delete')}
      </Button>
      <ConfirmDialog
        opened={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={onDelete}
        title={t('delete.title')}
        message={t('delete.message')}
        confirmLabel={t('delete.confirm')}
        cancelLabel={t('delete.cancel')}
        closeLabel={t('delete.close')}
        destructive
      />
    </>
  );
}
