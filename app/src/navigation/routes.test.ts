import { describe, expect, it } from 'vitest';
import { DEFAULT_SCREEN, isScreenId, routes, screenIds } from './routes';

describe('F1-01 routes', () => {
  it('has one route per screen package', () => {
    expect(routes.map((route) => route.id)).toEqual([...screenIds]);
  });

  it('shows the five main screens in the navigation and hides onboarding', () => {
    const navIds = routes.filter((route) => route.nav).map((route) => route.id);
    expect(navIds).toEqual(['today', 'week', 'friends', 'noteboard', 'settings']);
  });

  it('opens on Today by default', () => {
    expect(DEFAULT_SCREEN).toBe('today');
  });

  it('recognises only known screen ids', () => {
    expect(isScreenId('week')).toBe(true);
    expect(isScreenId('admin')).toBe(false);
  });
});
