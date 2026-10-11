/**
 * RNF-01: the app must never reach the network. During end-to-end tests the only allowed
 * requests are to the local server that serves the built app, plus inline data and blob URLs.
 */
export function isAllowedRequest(url: string, appOrigin: string): boolean {
  if (url.startsWith('data:') || url.startsWith('blob:')) return true;
  return new URL(url).origin === new URL(appOrigin).origin;
}
