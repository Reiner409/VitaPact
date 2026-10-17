import { useTranslation } from '@vitapact/i18n';
import { Button, Toast } from '@vitapact/ui';
import type { SaveNotice } from './useSaveDay';

export interface SaveDayProps {
  onSave: () => void;
  /** Values changed since the last save: they stay on this screen until "Save day". */
  changed: boolean;
  notice: SaveNotice;
  onCloseNotice: () => void;
}

/** F3-TD-06: the save button, a reminder of unsaved changes and the confirmation. */
export function SaveDay({ onSave, changed, notice, onCloseNotice }: SaveDayProps) {
  const { t } = useTranslation('today');
  return (
    <>
      <div>
        <Button onClick={onSave}>{t('save')}</Button>
      </div>
      {changed && <p>{t('unsaved')}</p>}
      <Toast
        opened={notice !== null}
        tone={notice === 'failed' ? 'error' : 'success'}
        message={t(notice === 'failed' ? 'notices.failed' : 'notices.saved')}
        closeLabel={t('notices.close')}
        onClose={onCloseNotice}
      />
    </>
  );
}
