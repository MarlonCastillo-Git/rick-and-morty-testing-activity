import { describe, expect, it } from 'vitest';
import { parsePage, getEpisodeIds, formatCreatedDate } from '@/lib/utils';

describe('parsePage', () => {
  it.each([undefined, [], ['2'], '', 'abc', '2foo', '-1', '0', '1.5', 'Infinity', '9007199254740992'])('defaults invalid input %j to page one', (value) => {
    expect(parsePage(value)).toBe(1);
  });
  it.each([['2', 2], ['100', 100], ['01', 1]])('parses %s', (input, output) => expect(parsePage(input)).toBe(output));
});
describe('episode identifiers', () => {
  it('extracts identifiers in order, accepting trailing slashes', () => {
    expect(getEpisodeIds(['https://rickandmortyapi.com/api/episode/1', 'https://rickandmortyapi.com/api/episode/2/'])).toEqual(['1', '2']);
  });
  it('handles empty collections and empty paths', () => {
    expect(getEpisodeIds([])).toEqual([]);
    expect(getEpisodeIds(['', '/'])).toEqual([]);
  });
});
describe('creation date', () => {
  it('uses an explicit UTC date even across time zones', () => expect(formatCreatedDate('2026-01-01T00:30:00Z')).toBe('January 1, 2026'));
  it('handles invalid dates', () => expect(formatCreatedDate('invalid')).toBe('Unknown'));
});
