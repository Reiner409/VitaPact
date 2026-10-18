import { useTranslation } from '@vitapact/i18n';
import { Button, Toast } from '@vitapact/ui';
import { useEffect } from 'react';
import type { SaveNotice } from './useSaveDay';

export interface SaveDayProps {
  onSave: () => void;
  /** Values changed since the last save: they stay on this screen until "Save day". */
  changed: boolean;
  notice: SaveNotice;
  onCloseNotice: () => void;
}

const noticeKey = {
  saved: 'notices.saved',
  failed: 'notices.failed',
  incomplete: 'notices.incomplete',
};

/**
 * On a phone the first missing answer is often far above the button, so the page goes there:
 * the field's announced error is the first alert on the screen.
 */
function useShowFirstMissing(notice: SaveNotice) {
  useEffect(() => {
    if (notice !== 'incomplete') return;
    document.querySelector('[role="alert"]')?.scrollIntoView({ block: 'center' });
  }, [notice]);
}

/** F3-TD-06: the save button, a reminder of unsaved changes and the confirmation. */
export function SaveDay({ onSave, changed, notice, onCloseNotice }: SaveDayProps) {
  const { t } = useTranslation('today');
  useShowFirstMissing(notice);
  return (
    <>
      <div>
        <Button onClick={onSave}>{t('save')}</Button>
      </div>
      {changed && <p>{t('unsaved')}</p>}
      <Toast
        opened={notice !== null}
        tone={notice === 'saved' ? 'success' : 'error'}
        message={notice ? t(noticeKey[notice]) : ''}
        closeLabel={t('notices.close')}
        onClose={onCloseNotice}
      />
    </>
  );
}
