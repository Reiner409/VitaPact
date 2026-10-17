import { useTranslation } from '@vitapact/i18n';
import { Button, Stack } from '@vitapact/ui';

export interface StepButtonsProps {
  continueLabel: string;
  onBack: () => void;
  loading?: boolean;
}

/** The submit button of a step and the way back to the previous one. */
export function StepButtons({ continueLabel, onBack, loading = false }: StepButtonsProps) {
  const { t } = useTranslation('onboarding');
  return (
    <Stack horizontal gap="tight">
      <Button type="submit" loading={loading}>
        {continueLabel}
      </Button>
      <Button variant="subtle" onClick={onBack}>
        {t('back')}
      </Button>
    </Stack>
  );
}
