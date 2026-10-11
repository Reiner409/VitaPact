const HEX_COLOR = /#[0-9a-fA-F]{3,8}\b/g;
const PIXEL_VALUE = /\b\d+(\.\d+)?px\b/g;
const COLOR_FUNCTION = /\b(rgba?|hsla?)\(/g;

/** Finds colours and pixel sizes written by hand; screens must use tokens instead (section 6.1). */
export function findRawStyleValues(source: string): string[] {
  return [HEX_COLOR, PIXEL_VALUE, COLOR_FUNCTION].flatMap((pattern) =>
    [...source.matchAll(pattern)].map(([match]) => match),
  );
}
