export function toBytes(contents: Uint8Array<ArrayBuffer> | string): Uint8Array<ArrayBuffer> {
  return typeof contents === 'string' ? new TextEncoder().encode(contents) : contents;
}
