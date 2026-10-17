import { useTranslation } from '@vitapact/i18n';
import { Card } from '@vitapact/ui';
import { useId } from 'react';
import { useFingerprint } from './useFingerprint';

export interface FingerprintCardProps {
  publicKey: CryptoKey | undefined;
}

/** Friends compare this in person to be sure the reports they read were signed by you (10.1). */
export function FingerprintCard({ publicKey }: FingerprintCardProps) {
  const { t } = useTranslation('settings');
  const headingId = useId();
  const fingerprint = useFingerprint(publicKey);
  return (
    <section aria-labelledby={headingId}>
      <Card>
        <h2 id={headingId}>{t('fingerprint.title')}</h2>
        <p>{t('fingerprint.explanation')}</p>
        {fingerprint ? <p translate="no">{fingerprint}</p> : <p>{t('fingerprint.missing')}</p>}
      </Card>
    </section>
  );
}
