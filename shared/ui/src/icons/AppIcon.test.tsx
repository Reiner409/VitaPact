import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppIcon, appIcons, type IconName } from './AppIcon';

describe('AppIcon', () => {
  it.each(Object.keys(appIcons) as IconName[])(
    'renders "%s" at 20 px, stroke 1.75, hidden from screen readers',
    (name) => {
      const { container } = render(<AppIcon name={name} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '20');
      expect(svg).toHaveAttribute('stroke-width', '1.75');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    },
  );
});
