import { useTranslation } from '@vitapact/i18n';
import { Toast } from '@vitapact/ui';
import type { DataNotice } from './useDataTransfer';

export interface DataNoticeToastProps {
  notice: DataNotice | undefined;
  onClose: () => void;
}

const SUCCESSES: readonly DataNotice[] = ['exported', 'imported'];

export function DataNoticeToast({ notice, onClose }: DataNoticeToastProps) {
  const { t } = useTranslation('settings');
  const messages: Record<DataNotice, string> = {
    exported: t('data.notices.exported'),
    exportFailed: t('data.notices.exportFailed'),
    imported: t('data.notices.imported'),
    importDamaged: t('data.notices.importDamaged'),
    importUnknownVersion: t('data.notices.importUnknownVersion'),
    importFailed: t('data.notices.importFailed'),
  };
  return (
    <Toast
      opened={notice !== undefined}
      tone={notice && SUCCESSES.includes(notice) ? 'success' : 'error'}
      message={notice ? messages[notice] : ''}
      closeLabel={t('data.closeNotice')}
      onClose={onClose}
    />
  );
}
