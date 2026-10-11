import { beforeEach, describe, expect, it } from 'vitest';
import { screenFromHash, useNavigation } from './navigationStore';

describe('F1-01 navigation', () => {
  beforeEach(() => {
    window.location.hash = '';
    useNavigation.getState().syncFromLocation();
  });

  it('reads the screen from the hash', () => {
    expect(screenFromHash('#/week')).toBe('week');
    expect(screenFromHash('#/onboarding')).toBe('onboarding');
  });

  it('falls back to Today for an empty or unknown hash', () => {
    expect(screenFromHash('')).toBe('today');
    expect(screenFromHash('#/unknown')).toBe('today');
  });

  it('navigate updates both the state and the hash', () => {
    useNavigation.getState().navigate('friends');
    expect(useNavigation.getState().current).toBe('friends');
    expect(window.location.hash).toBe('#/friends');
  });
});
