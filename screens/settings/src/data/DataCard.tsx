import { useTranslation } from '@vitapact/i18n';
import { Button, Card, ConfirmDialog } from '@vitapact/ui';
import { useId } from 'react';
import { DataNoticeToast } from './DataNoticeToast';
import { useDataTransfer, type DataTransferOptions } from './useDataTransfer';

export type DataCardProps = Omit<DataTransferOptions, 'fileTypeName'>;

/** Export and import of all data to a file the user chooses (RF-19, D35, D38). */
export function DataCard(props: DataCardProps) {
  const { t } = useTranslation('settings');
  const headingId = useId();
  const transfer = useDataTransfer({ ...props, fileTypeName: t('data.fileType') });
  const { pending } = transfer;
  const otherUser = pending?.step === 'otherUser';

  return (
    <section aria-labelledby={headingId}>
      <Card>
        <h2 id={headingId}>{t('data.title')}</h2>
        <p>{t('data.explanation')}</p>
        <Button disabled={transfer.busy} onClick={() => void transfer.exportAll()}>
          {t('data.export')}
        </Button>
        <Button
          variant="secondary"
          disabled={transfer.busy}
          onClick={() => void transfer.chooseImport()}
        >
          {t('data.import')}
        </Button>
      </Card>
      <ConfirmDialog
        opened={pending !== undefined}
        onClose={transfer.cancelImport}
        onConfirm={() => pending && void transfer.confirmImport(pending)}
        title={otherUser ? t('data.otherUser.title') : t('data.overwrite.title')}
        message={otherUser ? t('data.otherUser.message') : t('data.overwrite.message')}
        confirmLabel={otherUser ? t('data.otherUser.confirm') : t('data.overwrite.confirm')}
        cancelLabel={t('data.cancel')}
        closeLabel={t('data.closeNotice')}
        destructive
      />
      <DataNoticeToast notice={transfer.notice} onClose={transfer.closeNotice} />
    </section>
  );
}
