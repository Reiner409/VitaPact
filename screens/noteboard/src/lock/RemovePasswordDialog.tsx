import { useTranslation } from '@vitapact/i18n';
import { Button, Modal, PasswordField, Stack } from '@vitapact/ui';
import { useState } from 'react';

export interface RemovePasswordDialogProps {
  opened: boolean;
  /** Resolves to false when the current password is wrong. */
  onRemove: (password: string) => Promise<boolean>;
  onClose: () => void;
}

/** F3-NB-06: the current password, then every note goes back to plain text. */
function RemovePasswordForm({ onRemove, onClose }: Omit<RemovePasswordDialogProps, 'opened'>) {
  const { t } = useTranslation('noteboard');
  const [password, setPassword] = useState('');
  const [wrong, setWrong] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (await onRemove(password)) onClose();
    else setWrong(true);
  }

  return (
    <form onSubmit={(event) => void submit(event)} noValidate>
      <Stack>
        <p>{t('lock.remove.message')}</p>
        <PasswordField
          label={t('lock.remove.password')}
          showLabel={t('lock.show')}
          hideLabel={t('lock.hide')}
          value={password}
          onChange={(value) => {
            setPassword(value);
            setWrong(false);
          }}
          {...(wrong && { error: t('lock.wrong') })}
        />
        <Button type="submit">{t('lock.remove.confirm')}</Button>
        <Button variant="subtle" onClick={onClose}>
          {t('lock.cancel')}
        </Button>
      </Stack>
    </form>
  );
}

export function RemovePasswordDialog({ opened, ...props }: RemovePasswordDialogProps) {
  const { t } = useTranslation('noteboard');
  return (
    <Modal
      opened={opened}
      onClose={props.onClose}
      title={t('lock.remove.title')}
      closeLabel={t('lock.close')}
      size="medium"
    >
      {opened && <RemovePasswordForm {...props} />}
    </Modal>
  );
}
