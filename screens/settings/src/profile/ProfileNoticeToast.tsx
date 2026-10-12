import { useTranslation } from '@vitapact/i18n';
import { Toast } from '@vitapact/ui';
import type { ProfileNotice } from './useProfileEditor';

export interface ProfileNoticeToastProps {
  notice: ProfileNotice | undefined;
  onClose: () => void;
}

const FAILURES: readonly ProfileNotice[] = ['saveFailed', 'copyFailed'];

export function ProfileNoticeToast({ notice, onClose }: ProfileNoticeToastProps) {
  const { t } = useTranslation('settings');
  const messages: Record<ProfileNotice, string> = {
    saved: t('profile.notices.saved'),
    saveFailed: t('profile.notices.saveFailed'),
    copied: t('profile.notices.copied'),
    copyFailed: t('profile.notices.copyFailed'),
  };
  return (
    <Toast
      opened={notice !== undefined}
      tone={notice && FAILURES.includes(notice) ? 'error' : 'success'}
      message={notice ? messages[notice] : ''}
      closeLabel={t('profile.closeNotice')}
      onClose={onClose}
    />
  );
}
