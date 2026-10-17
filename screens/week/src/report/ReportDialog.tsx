import { useTranslation } from '@vitapact/i18n';
import { Banner, Button, Modal, Stack } from '@vitapact/ui';
import type { ReportState } from './useReport';

export interface ReportDialogProps {
  state: ReportState;
  onSave: () => void;
  onClose: () => void;
}

/** F3-WK-06: the report preview and the button that saves it as a PNG. */
export function ReportDialog({ state, onSave, onClose }: ReportDialogProps) {
  const { t } = useTranslation('week');
  return (
    <Modal
      opened={state.status !== 'closed'}
      onClose={onClose}
      title={t('report.title')}
      closeLabel={t('report.close')}
      size="medium"
    >
      <Stack>
        {state.status === 'making' && <p>{t('report.making')}</p>}
        {state.status === 'failed' && (
          <Banner tone="warning" icon="error">
            {t('report.failed')}
          </Banner>
        )}
        {state.status === 'ready' && (
          <>
            <img src={state.previewUrl} alt={t('report.preview')} width="100%" />
            {state.saved && (
              <Banner tone="info" icon="success">
                {t('report.saved')}
              </Banner>
            )}
            <div>
              <Button onClick={onSave}>{t('report.save')}</Button>
            </div>
          </>
        )}
      </Stack>
    </Modal>
  );
}
