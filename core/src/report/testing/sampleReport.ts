import {
  REPORT_IMAGE_HEIGHT,
  REPORT_IMAGE_WIDTH,
  drawReportImage,
  layoutReportImage,
  type ReportCard,
  type ReportImageTheme,
  type ReportPixels,
} from '../image';
import { pixelCanvas } from './pixelCanvas';

/** Every byte value, as long as the largest report allowed (F2-10), so nothing depends on text. */
export const sampleReportContent = Uint8Array.from(
  { length: 560 },
  (_, index) => (index * 37) % 256,
);

export const sampleReportCard: ReportCard = {
  content: sampleReportContent,
  nickname: 'Rei',
  userId: '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90',
  weekLabel: 'Week 41 · 2026',
  periodLabel: '5-11 Oct 2026',
  scoreLabel: '62',
  verdictLabel: 'Solid base',
  indicators: [
    { pillar: 'sleep', label: 'Sleep', value: '7.0 h · 4/7' },
    { pillar: 'training', label: 'Training', value: '2/3 · 110 min' },
    { pillar: 'food', label: 'Clean eating', value: '4/7' },
    { pillar: 'sun', label: 'Sun', value: '3/7' },
  ],
  weightLabel: '78.4 kg (-0.6)',
  motto: 'Join the VitalityMaxxing lifestyle',
};

export const sampleReportTheme: ReportImageTheme = {
  fontFamily: 'Inter, sans-serif',
  colors: {
    background: '#F6F1E7',
    text: '#1F2A24',
    textMuted: '#5B665F',
    primary: '#2F6B4F',
    sleep: '#5B6CC2',
    training: '#C2703D',
    food: '#4E9A5B',
    sun: '#D9A21B',
    qrDark: '#000000',
    qrLight: '#FFFFFF',
  },
};

/** The report image as pixels, painted by the Node test canvas. */
export function renderReportPixels(
  reportCard: ReportCard,
  theme = sampleReportTheme,
): ReportPixels {
  const canvas = pixelCanvas(REPORT_IMAGE_WIDTH, REPORT_IMAGE_HEIGHT);
  drawReportImage(canvas.context, layoutReportImage(reportCard), theme);
  return canvas.pixels;
}
