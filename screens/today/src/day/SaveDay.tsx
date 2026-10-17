import { useTranslation } from '@vitapact/i18n';
import { Button, ScoreRing, Toast } from '@vitapact/ui';
import type { SaveNotice } from './useSaveDay';

export interface SaveDayProps {
  onSave: () => void;
  /** The score of the saved entry of the day shown, or `null` before its first save. */
  savedScore: number | null;
  notice: SaveNotice;
  onCloseNotice: () => void;
}

/** F3-TD-06: the save button, the day's score once saved and the confirmation. */
export function SaveDay({ onSave, savedScore, notice, onCloseNotice }: SaveDayProps) {
  const { t } = useTranslation('today');
  return (
    <>
      <div>
        <Button onClick={onSave}>{t('save')}</Button>
      </div>
      {savedScore !== null && <ScoreRing score={savedScore} label={t('dayScore')} />}
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
