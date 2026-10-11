const MIN_WIDTH = /min-width:\s*([\d.]+)(px|em)/;
const MAX_WIDTH = /max-width:\s*([\d.]+)(px|em)/;
const EM_IN_PX = 16;

function widthInPx(match: RegExpExecArray | null): number | undefined {
  if (!match) return undefined;
  const value = Number(match[1]);
  return match[2] === 'em' ? value * EM_IN_PX : value;
}

function matchesWidth(query: string, width: number): boolean {
  const min = widthInPx(MIN_WIDTH.exec(query));
  const max = widthInPx(MAX_WIDTH.exec(query));
  return (min === undefined || width >= min) && (max === undefined || width <= max);
}

/** Makes `window.matchMedia` answer width queries as a window of the given width would (jsdom has no layout). */
export function setViewportWidth(width: number) {
  window.matchMedia = (query: string) => ({
    matches: matchesWidth(query, width),
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  });
}
