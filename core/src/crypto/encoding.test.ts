import { describe, expect, it } from 'vitest';
import { base64UrlToBytes, bytesToBase64Url } from './encoding';

describe('RF-28 base64url encoding for keys and signatures', () => {
  it('RF-28 round-trips every byte value without padding or URL-unsafe characters', () => {
    const bytes = Uint8Array.from({ length: 256 }, (_, index) => index);

    const encoded = bytesToBase64Url(bytes);

    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(base64UrlToBytes(encoded)).toEqual(bytes);
  });

  it('RF-28 rejects text that is not base64url', () => {
    expect(() => base64UrlToBytes('a+b/c=')).toThrow(SyntaxError);
  });
});
