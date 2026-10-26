/** Query parameters are untrusted: only positive safe integers are valid pages. */
export function parsePage(value: string | string[] | undefined): number {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return 1;
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export function getEpisodeIds(urls: string[]): string[] {
  return urls.map((url) => url.split('/').filter(Boolean).pop() ?? '').filter(Boolean);
}

/** UTC keeps the displayed day identical on the server and in different time zones. */
export function formatCreatedDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });
}
