import { readQrCode } from '@vitapact/core/report';
import { renderReportPixels, sampleReportCard } from '@vitapact/core/report/testing';
import { describe, expect, it } from 'vitest';
import { reportImageTheme } from './reportTheme';

describe('RF-10 report image in the app colours', () => {
  it('keeps the QR code readable', () => {
    const pixels = renderReportPixels(sampleReportCard, reportImageTheme);
    const read = readQrCode(pixels);
    expect(read.ok && Array.from(read.content)).toEqual(Array.from(sampleReportCard.content));
  });
});
