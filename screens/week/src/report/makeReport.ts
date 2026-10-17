import { createSigningKeys } from '@vitapact/core/crypto';
import {
  REPORT_IMAGE_HEIGHT,
  REPORT_IMAGE_WIDTH,
  createReport,
  drawReportImage,
  layoutReportImage,
  type ReportCard,
  type WeekReportInput,
} from '@vitapact/core/report';
import { saveProfile, type Profile, type VitaPactDatabase } from '@vitapact/core/storage';
import { renderPng } from '@vitapact/platform';
import { reportImageTheme } from '@vitapact/ui';

/** Profiles made before the keys existed get them on their first report (RF-02). */
export async function signingKeysOf(db: VitaPactDatabase, profile: Profile) {
  if (profile.signingKeys) return profile.signingKeys;
  const signingKeys = await createSigningKeys();
  await saveProfile(db, { ...profile, signingKeys });
  return signingKeys;
}

export const signedReport = (input: WeekReportInput, keys: CryptoKeyPair) =>
  createReport(input, keys);

/** RF-10: the PNG friends receive. */
export const reportPng = (card: ReportCard): Promise<Blob> =>
  renderPng(REPORT_IMAGE_WIDTH, REPORT_IMAGE_HEIGHT, (context) =>
    drawReportImage(context, layoutReportImage(card), reportImageTheme),
  );
