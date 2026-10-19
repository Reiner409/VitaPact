import { UnstyledButton } from '@mantine/core';
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

  it('RNF-10 leaves the keyboard focus ring of every Mantine control to the token rule', () => {
    render(
      <VitaPactProvider>
        <UnstyledButton>Week</UnstyledButton>
      </VitaPactProvider>,
    );
    const button = screen.getByRole('button', { name: 'Week' });
    expect(button.className).not.toMatch(/mantine-focus-(never|auto|always)/);
    expect(button).toHaveClass('vp-focus');
  });
});
