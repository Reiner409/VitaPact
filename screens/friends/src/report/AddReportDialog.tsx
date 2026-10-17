import type { Group } from '@vitapact/core/storage';
import { useTranslation } from '@vitapact/i18n';
import { Banner, Button, Modal, Stack } from '@vitapact/ui';
import { useState } from 'react';
import { problemText } from './problemText';
import { ReportPreview } from './ReportPreview';
import type { AddReportState } from './useAddReport';

export interface AddReportDialogProps {
  state: AddReportState;
  groups: readonly Group[];
  onConfirm: (groupIds: readonly string[]) => void;
  onChooseAnother: () => void;
  onClose: () => void;
}

type ReadyState = Extract<AddReportState, { kind: 'ready' | 'saveFailed' }>;

function ReadyContent({
  state,
  groups,
  onConfirm,
  onClose,
}: AddReportDialogProps & { state: ReadyState }) {
  const { t } = useTranslation('friends');
  const [groupIds, setGroupIds] = useState<string[]>([]);
  return (
    <Stack>
      <ReportPreview
        summary={state.summary}
        outcome={state.outcome}
        groups={groups}
        groupIds={groupIds}
        onGroupsChange={setGroupIds}
      />
      {state.kind === 'saveFailed' && (
        <Banner tone="warning" icon="error">
          {t('addReport.saveFailed')}
        </Banner>
      )}
      <Button onClick={() => onConfirm(groupIds)}>{t('addReport.confirm')}</Button>
      <Button variant="subtle" onClick={onClose}>
        {t('addReport.cancel')}
      </Button>
    </Stack>
  );
}

function DialogContent(props: AddReportDialogProps) {
  const { t } = useTranslation('friends');
  const { state } = props;
  if (state.kind === 'reading') return <p>{t('addReport.reading')}</p>;
  if (state.kind === 'rejected') {
    return (
      <Stack>
        <Banner tone="warning" icon="error">
          {problemText(t, state.reason)}
        </Banner>
        <Button onClick={props.onChooseAnother}>{t('addReport.chooseAnother')}</Button>
      </Stack>
    );
  }
  if (state.kind === 'closed') return null;
  return <ReadyContent {...props} state={state} />;
}

/** F2-19 ReportImport: the steps of adding a friend's report, from image to confirmation. */
export function AddReportDialog(props: AddReportDialogProps) {
  const { t } = useTranslation('friends');
  return (
    <Modal
      opened={props.state.kind !== 'closed'}
      onClose={props.onClose}
      title={t('addReport.title')}
      closeLabel={t('close')}
    >
      <DialogContent {...props} />
    </Modal>
  );
}
