import type { ReportImageTheme } from '@vitapact/core/report';
import { tokens } from '../tokens';

const { color } = tokens;

/** The report image painted with the app's own colours and font (G4.1). */
export const reportImageTheme: ReportImageTheme = {
  fontFamily: tokens.font.family,
  colors: {
    background: color.bg,
    text: color.text,
    textMuted: color.textMuted,
    primary: color.primaryStrong,
    sleep: color.pillar.sleep,
    training: color.pillar.training,
    food: color.pillar.food,
    sun: color.pillar.sun,
    qrDark: tokens.qr.dark,
    qrLight: tokens.qr.light,
  },
};
