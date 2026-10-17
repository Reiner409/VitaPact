import { saveProfile, type Profile, type VitaPactDatabase } from '@vitapact/core/storage';
import { useTranslation } from '@vitapact/i18n';
import { getPlatform } from '@vitapact/platform';
import { PageHeader, Stack } from '@vitapact/ui';
import { AboutCard } from './about/AboutCard';
import { copyToClipboard } from './clipboard';
import { DeleteAllCard } from './danger/DeleteAllCard';
import { DataCard } from './data/DataCard';
import type { DataFiles } from './data/dataFiles';
import { GroupsCard } from './groups/GroupsCard';
import { FingerprintCard } from './identity/FingerprintCard';
import { ProfileCard } from './profile/ProfileCard';

export interface SettingsScreenProps {
  db: VitaPactDatabase;
  profile: Profile | undefined;
  onProfileChange: () => Promise<void>;
  copyText?: (text: string) => Promise<void>;
  /** The system file dialogs; tests pass a fake. */
  files?: DataFiles;
  /** The moment written in an export; tests pass a fixed one. */
  now?: () => Date;
}

const systemNow = () => new Date();

export function SettingsScreen({
  db,
  profile,
  onProfileChange,
  copyText = copyToClipboard,
  files = getPlatform(),
  now = systemNow,
}: SettingsScreenProps) {
  const { t } = useTranslation('settings');
  return (
    <>
      <PageHeader title={t('title')} />
      <Stack>
        {profile && (
          <ProfileCard
            profile={profile}
            onSave={(updated) => saveProfile(db, updated)}
            onSaved={onProfileChange}
            onCopyUserId={copyText}
          />
        )}
        <GroupsCard db={db} now={now} />
        <FingerprintCard publicKey={profile?.signingKeys?.publicKey} />
        <DataCard db={db} files={files} now={now} onImported={onProfileChange} />
        <AboutCard />
        <DeleteAllCard db={db} onDeleted={onProfileChange} />
      </Stack>
    </>
  );
}
