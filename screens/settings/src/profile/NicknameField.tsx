import { NICKNAME_MAX_LENGTH } from '@vitapact/core/report';
import { useTranslation } from '@vitapact/i18n';
import { TextField } from '@vitapact/ui';
import type { ProfileFormError } from './profileForm';

export interface NicknameFieldProps {
  value: string;
  error: ProfileFormError | undefined;
  onChange: (nickname: string) => void;
}

export function NicknameField({ value, error, onChange }: NicknameFieldProps) {
  const { t } = useTranslation('settings');
  const messages: Partial<Record<ProfileFormError, string>> = {
    nicknameRequired: t('profile.errors.nicknameRequired'),
    nicknameInvalid: t('profile.errors.nicknameInvalid', { max: NICKNAME_MAX_LENGTH }),
  };
  const message = error && messages[error];
  return (
    <TextField
      label={t('profile.nickname')}
      value={value}
      onChange={onChange}
      maxLength={NICKNAME_MAX_LENGTH}
      {...(message && { error: message })}
    />
  );
}
