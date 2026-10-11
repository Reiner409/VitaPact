import { Banner } from '../Banner/Banner';
import { Button } from '../Button/Button';

export interface WeighInBannerProps {
  /** Translated reminder, e.g. "Sunday weigh-in still to do: you have until Tuesday." */
  message: string;
  /** Translated label of the button that opens the weigh-in. */
  actionLabel: string;
  onWeighIn: () => void;
}

/**
 * The weigh-in reminder shown on every screen until the weigh-in is entered (RF-06, RF-07).
 * The screen decides when it shows, from the weigh-in state in core.
 */
export function WeighInBanner({ message, actionLabel, onWeighIn }: WeighInBannerProps) {
  return (
    <Banner
      tone="warning"
      icon="weighIn"
      action={
        <Button variant="primary" onClick={onWeighIn}>
          {actionLabel}
        </Button>
      }
    >
      {message}
    </Banner>
  );
}
