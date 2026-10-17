import { deleteAllData, type VitaPactDatabase } from '@vitapact/core/storage';
import { useTranslation } from '@vitapact/i18n';
import { Banner, Button, Card, ConfirmDialog } from '@vitapact/ui';
import { useId, useState } from 'react';

export interface DeleteAllCardProps {
  db: VitaPactDatabase;
  /** Called once everything is gone, so the app goes back to the welcome. */
  onDeleted: () => Promise<void>;
}

type Step = 'idle' | 'first' | 'second' | 'failed';

interface DeleteAllDialogsProps {
  step: Step;
  setStep: (step: Step) => void;
  onDelete: () => Promise<void>;
}

/** Two confirmations: first a warning, then the word typed out (section 5.6). */
function DeleteAllDialogs({ step, setStep, onDelete }: DeleteAllDialogsProps) {
  const { t } = useTranslation('settings');
  const close = () => setStep('idle');
  return (
    <>
      <ConfirmDialog
        opened={step === 'first'}
        onClose={close}
        onConfirm={() => setStep('second')}
        title={t('deleteAll.first.title')}
        message={t('deleteAll.first.message')}
        confirmLabel={t('deleteAll.first.confirm')}
        cancelLabel={t('deleteAll.cancel')}
        closeLabel={t('deleteAll.close')}
        destructive
      />
      <ConfirmDialog
        opened={step === 'second'}
        onClose={close}
        onConfirm={() => void onDelete()}
        title={t('deleteAll.second.title')}
        message={t('deleteAll.second.message')}
        confirmLabel={t('deleteAll.second.confirm')}
        cancelLabel={t('deleteAll.cancel')}
        closeLabel={t('deleteAll.close')}
        destructive
        typedConfirmation={{ word: t('deleteAll.second.word'), label: t('deleteAll.second.label') }}
      />
    </>
  );
}

/** F3-ST-04 RF-20: deletes every record on this device, after two confirmations. */
export function DeleteAllCard({ db, onDeleted }: DeleteAllCardProps) {
  const { t } = useTranslation('settings');
  const headingId = useId();
  const [step, setStep] = useState<Step>('idle');

  async function deleteEverything() {
    try {
      await deleteAllData(db);
      setStep('idle');
      await onDeleted();
    } catch {
      setStep('failed');
    }
  }

  return (
    <section aria-labelledby={headingId}>
      <Card>
        <h2 id={headingId}>{t('deleteAll.title')}</h2>
        <p>{t('deleteAll.explanation')}</p>
        {step === 'failed' && (
          <Banner tone="warning" icon="error">
            {t('deleteAll.failed')}
          </Banner>
        )}
        <Button variant="destructive" onClick={() => setStep('first')}>
          {t('deleteAll.open')}
        </Button>
      </Card>
      <DeleteAllDialogs step={step} setStep={setStep} onDelete={deleteEverything} />
    </section>
  );
}
