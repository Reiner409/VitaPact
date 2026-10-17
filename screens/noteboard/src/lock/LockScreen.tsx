import { useTranslation } from '@vitapact/i18n';
import { Button, Card, PageHeader, PasswordField, Stack } from '@vitapact/ui';
import { useState } from 'react';

export interface LockScreenProps {
  /** Resolves to false when the password is wrong. */
  onUnlock: (password: string) => Promise<boolean>;
}

/** F3-NB-05: the Noteboard asks for its password before showing anything. */
export function LockScreen({ onUnlock }: LockScreenProps) {
  const { t } = useTranslation('noteboard');
  const [password, setPassword] = useState('');
  const [wrong, setWrong] = useState(false);
  const [busy, setBusy] = useState(false);

  async function unlock(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const right = await onUnlock(password);
    setBusy(false);
    setWrong(!right);
  }

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('lock.lockedSubtitle')} />
      <Card>
        <form onSubmit={(event) => void unlock(event)} noValidate>
          <Stack>
            <PasswordField
              label={t('lock.password')}
              showLabel={t('lock.show')}
              hideLabel={t('lock.hide')}
              value={password}
              onChange={(value) => {
                setPassword(value);
                setWrong(false);
              }}
              {...(wrong && { error: t('lock.wrong') })}
            />
            <div>
              <Button type="submit" loading={busy}>
                {t('lock.unlock')}
              </Button>
            </div>
          </Stack>
        </form>
      </Card>
    </>
  );
}
