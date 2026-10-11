import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VitaPactProvider } from './VitaPactProvider';

describe('VitaPactProvider', () => {
  it('renders its children', () => {
    render(
      <VitaPactProvider>
        <p>child</p>
      </VitaPactProvider>,
    );
    expect(screen.getByText('child')).toBeInTheDocument();
  });

  it('publishes the token CSS variables', () => {
    render(<VitaPactProvider>{null}</VitaPactProvider>);
    const styles = Array.from(document.querySelectorAll('style'))
      .map((element) => element.textContent)
      .join('\n');
    expect(styles).toContain('--vp-color-bg: #F5F0E6');
    expect(styles).toContain('prefers-reduced-motion');
  });
});
