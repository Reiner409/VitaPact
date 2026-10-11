import { describe, expect, it } from 'vitest';
import { isAllowedRequest } from './networkGuard';

const app = 'http://localhost:4173';

describe('RNF-01 end-to-end network guard', () => {
  it('allows the local app server', () => {
    expect(isAllowedRequest('http://localhost:4173/assets/index.js', app)).toBe(true);
  });

  it('allows inline data and blob URLs', () => {
    expect(isAllowedRequest('data:image/png;base64,AAAA', app)).toBe(true);
    expect(isAllowedRequest('blob:http://localhost:4173/1234', app)).toBe(true);
  });

  it.each(['https://example.com/', 'http://localhost:5000/', 'https://fonts.googleapis.com/css'])(
    'rejects %s',
    (url) => {
      expect(isAllowedRequest(url, app)).toBe(false);
    },
  );
});
