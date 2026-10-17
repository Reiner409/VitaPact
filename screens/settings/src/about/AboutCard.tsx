import { useTranslation } from '@vitapact/i18n';
import { Card } from '@vitapact/ui';
import { useId } from 'react';
import packageInfo from '../../package.json';

export const SOURCE_CODE_URL = 'https://github.com/Reiner409/vitapact';

/** Version and licence come from the package, so a release never shows a stale hand-written value. */
export function AboutCard() {
  const { t } = useTranslation('settings');
  const headingId = useId();
  return (
    <section aria-labelledby={headingId}>
      <Card>
        <h2 id={headingId}>{t('about.title')}</h2>
        <dl>
          <dt>{t('about.version')}</dt>
          <dd>{packageInfo.version}</dd>
          <dt>{t('about.licence')}</dt>
          <dd>{packageInfo.license}</dd>
          <dt>{t('about.sourceCode')}</dt>
          <dd translate="no">{SOURCE_CODE_URL}</dd>
          <dt>{t('about.dataLocation')}</dt>
          <dd>{t('about.dataLocationText')}</dd>
        </dl>
      </Card>
    </section>
  );
}
