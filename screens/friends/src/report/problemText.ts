import type { useTranslation } from '@vitapact/i18n';
import type { AddReportProblem } from './useAddReport';

type Translate = ReturnType<typeof useTranslation>['t'];

/** RF-12: one message for each way an image can fail to become a friend's report. */
export function problemText(t: Translate, problem: AddReportProblem): string {
  const texts: Record<AddReportProblem, string> = {
    notAnImage: t('friends:addReport.problems.notAnImage'),
    imageTooLarge: t('friends:addReport.problems.imageTooLarge'),
    unreadableImage: t('friends:addReport.problems.unreadableImage'),
    noQrCode: t('friends:addReport.problems.noQrCode'),
    notAReport: t('friends:addReport.problems.notAReport'),
    futureVersion: t('friends:addReport.problems.futureVersion'),
    damaged: t('friends:addReport.problems.damaged'),
    invalidContent: t('friends:addReport.problems.invalidContent'),
    invalidSignature: t('friends:addReport.problems.invalidSignature'),
    ownReport: t('friends:addReport.problems.ownReport'),
    keyChanged: t('friends:addReport.problems.keyChanged'),
  };
  return texts[problem];
}
