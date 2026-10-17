import { useTranslation } from '@vitapact/i18n';
import { Banner, Button, Modal, PasswordField, Stack } from '@vitapact/ui';
import { useState } from 'react';

export interface SetPasswordDialogProps {
  opened: boolean;
  onSet: (password: string) => Promise<void>;
  onClose: () => void;
}

type Problem = 'missing' | 'mismatch' | 'failed';

function problemOf(password: string, repeated: string): Problem | undefined {
  if (password === '') return 'missing';
  return password === repeated ? undefined : 'mismatch';
}

function useSetPassword({ onSet, onClose }: Omit<SetPasswordDialogProps, 'opened'>) {
  const [password, setPassword] = useState('');
  const [repeated, setRepeated] = useState('');
  const [problem, setProblem] = useState<Problem>();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const found = problemOf(password, repeated);
    setProblem(found);
    if (found) return;
    try {
      await onSet(password);
      onClose();
    } catch {
      setProblem('failed');
    }
  }
  return { password, setPassword, repeated, setRepeated, problem, submit };
}

/** F3-NB-04: a password typed twice, with the warning that nobody can recover it. */
function SetPasswordForm(props: Omit<SetPasswordDialogProps, 'opened'>) {
  const { t } = useTranslation('noteboard');
  const { password, setPassword, repeated, setRepeated, problem, submit } = useSetPassword(props);
  const fieldText = { showLabel: t('lock.show'), hideLabel: t('lock.hide') };

  return (
    <form onSubmit={(event) => void submit(event)} noValidate>
      <Stack>
        <Banner tone="warning" icon="error">
          {t('lock.set.warning')}
        </Banner>
        <PasswordField
          {...fieldText}
          label={t('lock.set.password')}
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          {...(problem === 'missing' && { error: t('lock.set.missing') })}
        />
        <PasswordField
          {...fieldText}
          label={t('lock.set.repeat')}
          value={repeated}
          onChange={setRepeated}
          autoComplete="new-password"
          {...(problem === 'mismatch' && { error: t('lock.set.mismatch') })}
        />
        {problem === 'failed' && <Banner tone="warning">{t('lock.set.failed')}</Banner>}
        <Button type="submit">{t('lock.set.confirm')}</Button>
        <Button variant="subtle" onClick={props.onClose}>
          {t('lock.cancel')}
        </Button>
      </Stack>
    </form>
  );
}

export function SetPasswordDialog({ opened, ...props }: SetPasswordDialogProps) {
  const { t } = useTranslation('noteboard');
  return (
    <Modal
      opened={opened}
      onClose={props.onClose}
      title={t('lock.set.title')}
      closeLabel={t('lock.close')}
      size="medium"
    >
      {opened && <SetPasswordForm {...props} />}
    </Modal>
  );
}
