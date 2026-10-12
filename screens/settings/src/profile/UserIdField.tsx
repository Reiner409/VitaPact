import { useTranslation } from '@vitapact/i18n';
import { Button } from '@vitapact/ui';

export interface UserIdFieldProps {
  userId: string;
  onCopy: () => void;
}

/** The UUID friends know you by: shown as text, never as a field, so it cannot change (RF-02). */
export function UserIdField({ userId, onCopy }: UserIdFieldProps) {
  const { t } = useTranslation('settings');
  return (
    <>
      <dl>
        <dt>{t('profile.userId')}</dt>
        <dd>{userId}</dd>
      </dl>
      <Button variant="secondary" onClick={onCopy}>
        {t('profile.copyUserId')}
      </Button>
    </>
  );
}
