import type { VitaPactDatabase } from '@vitapact/core/storage';
import { useTranslation } from '@vitapact/i18n';
import { Button } from '@vitapact/ui';
import { useMemo, useState } from 'react';
import { LockScreen } from './lock/LockScreen';
import { RemovePasswordDialog } from './lock/RemovePasswordDialog';
import { SetPasswordDialog } from './lock/SetPasswordDialog';
import { useNotesLock } from './lock/useNotesLock';
import { Noteboard, type NoteboardProps } from './Noteboard';
import { notesStoreOf } from './notes/notesStore';

export interface NoteboardScreenProps {
  db: VitaPactDatabase;
  clock?: NoteboardProps['clock'];
}

type LockState = ReturnType<typeof useNotesLock>;

/** The padlock actions next to "New note": set the password, or lock now and remove it. */
function LockActions({ notesLock }: { notesLock: LockState }) {
  const { t } = useTranslation('noteboard');
  const [dialog, setDialog] = useState<'set' | 'remove'>();
  const close = () => setDialog(undefined);
  const unlocked = notesLock.lock.status === 'unlocked';
  return (
    <>
      {unlocked ? (
        <>
          <Button variant="secondary" onClick={notesLock.lockNow}>
            {t('lock.lockNow')}
          </Button>
          <Button variant="subtle" onClick={() => setDialog('remove')}>
            {t('lock.remove.open')}
          </Button>
        </>
      ) : (
        <Button variant="secondary" onClick={() => setDialog('set')}>
          {t('lock.set.open')}
        </Button>
      )}
      <SetPasswordDialog opened={dialog === 'set'} onSet={notesLock.setPassword} onClose={close} />
      <RemovePasswordDialog
        opened={dialog === 'remove'}
        onRemove={notesLock.removePassword}
        onClose={close}
      />
    </>
  );
}

/** RF-17, RF-18: the notes, behind their password when one is set. */
export function NoteboardScreen({ db, clock }: NoteboardScreenProps) {
  const notesLock = useNotesLock(db);
  const { lock } = notesLock;
  const key = lock.status === 'unlocked' ? lock.key : undefined;
  const store = useMemo(() => notesStoreOf(db, key), [db, key]);
  if (lock.status === 'loading') return null;
  if (lock.status === 'locked') return <LockScreen onUnlock={notesLock.unlock} />;
  return (
    <Noteboard
      key={lock.status}
      store={store}
      {...(clock && { clock })}
      lockActions={<LockActions notesLock={notesLock} />}
    />
  );
}
