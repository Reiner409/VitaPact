import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@vitapact/ui/testing';
import { describe, expect, it, vi } from 'vitest';
import en from '../../locales/en/week.json';
import { ReportDialog } from './ReportDialog';
import type { ReportNotice } from './useReport';

function renderDialog(notice?: ReportNotice) {
  const handlers = { onSave: vi.fn(), onCopy: vi.fn(), onClose: vi.fn() };
  const png = new Blob([], { type: 'image/png' });
  renderWithProviders(
    <ReportDialog
      state={{ status: 'ready', png, previewUrl: 'blob:report', ...(notice && { notice }) }}
      {...handlers}
    />,
    { translations: { week: en } },
  );
  return handlers;
}

describe('F3-WK-06 RF-10 the report dialog', () => {
  it('saves or copies the image', async () => {
    const handlers = renderDialog();
    await userEvent.click(await screen.findByRole('button', { name: en.report.save }));
    await userEvent.click(screen.getByRole('button', { name: en.report.copy }));
    expect(handlers.onSave).toHaveBeenCalledOnce();
    expect(handlers.onCopy).toHaveBeenCalledOnce();
  });

  it.each([
    ['saved', en.report.saved],
    ['copied', en.report.copied],
    ['copyFailed', en.report.copyFailed],
  ] as const)('says what happened after %s', async (notice, text) => {
    renderDialog(notice);
    expect(await screen.findByText(text)).toBeInTheDocument();
  });
});
