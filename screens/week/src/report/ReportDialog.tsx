import { useTranslation } from '@vitapact/i18n';
import { Banner, Button, Modal, Stack } from '@vitapact/ui';
import type { ReportNotice, ReportState } from './useReport';

export interface ReportDialogProps {
  state: ReportState;
  onSave: () => void;
  onCopy: () => void;
  onClose: () => void;
}

function NoticeBanner({ notice }: { notice: ReportNotice }) {
  const { t } = useTranslation('week');
  if (notice === 'copyFailed') {
    return (
      <Banner tone="warning" icon="error">
        {t('report.copyFailed')}
      </Banner>
    );
  }
  return (
    <Banner tone="info" icon="success">
      {notice === 'saved' ? t('report.saved') : t('report.copied')}
    </Banner>
  );
}

/** F3-WK-06: the report preview, with the buttons that save it as a PNG or copy it. */
export function ReportDialog({ state, onSave, onCopy, onClose }: ReportDialogProps) {
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
            {state.notice && <NoticeBanner notice={state.notice} />}
            <Stack horizontal gap="tight">
              <Button onClick={onSave}>{t('report.save')}</Button>
              <Button variant="secondary" onClick={onCopy}>
                {t('report.copy')}
              </Button>
            </Stack>
          </>
        )}
      </Stack>
    </Modal>
  );
}
