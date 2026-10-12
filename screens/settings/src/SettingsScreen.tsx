import { saveProfile, type Profile, type VitaPactDatabase } from '@vitapact/core/storage';
import { useTranslation } from '@vitapact/i18n';
import { PageHeader } from '@vitapact/ui';
import { copyToClipboard } from './clipboard';
import { ProfileCard } from './profile/ProfileCard';

export interface SettingsScreenProps {
  db: VitaPactDatabase;
  profile: Profile | undefined;
  onProfileChange: () => Promise<void>;
  copyText?: (text: string) => Promise<void>;
}

export function SettingsScreen({
  db,
  profile,
  onProfileChange,
  copyText = copyToClipboard,
}: SettingsScreenProps) {
  const { t } = useTranslation('settings');
  const save = async (updated: Profile) => {
    await saveProfile(db, updated);
    await onProfileChange();
  };
  return (
    <>
      <PageHeader title={t('title')} />
      {profile && <ProfileCard profile={profile} onSave={save} onCopyUserId={copyText} />}
    </>
  );
}
