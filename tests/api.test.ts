import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCharacters, getCharacter, getEpisodes } from '@/lib/api';
import { character, characters, episode } from './fixtures';
const fetchMock = vi.fn();
beforeEach(() => { fetchMock.mockReset(); vi.stubGlobal('fetch', fetchMock); });
const respond = (data: unknown, ok = true) => fetchMock.mockResolvedValue({ ok, json: async () => data });
describe('API reads', () => {
  it('loads the default page', async () => {
    respond(characters); expect(await getCharacters()).toEqual(characters);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith('https://rickandmortyapi.com/api/character?page=1');
  });
  it('loads a requested page', async () => {
    respond(characters); await getCharacters(3);
    expect(fetchMock).toHaveBeenCalledWith('https://rickandmortyapi.com/api/character?page=3');
  });
  it('loads character details', async () => {
    respond(character); expect(await getCharacter('1')).toEqual(character);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith('https://rickandmortyapi.com/api/character/1');
  });
  it('does not fetch an empty episode list', async () => {
    expect(await getEpisodes([])).toEqual([]); expect(fetchMock).not.toHaveBeenCalled();
  });
  it('normalizes one episode to an array', async () => {
    respond(episode); expect(await getEpisodes(['1'])).toEqual([episode]);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith('https://rickandmortyapi.com/api/episode/1');
  });
  it('retains multiple episodes', async () => {
    const list = [episode, { ...episode, id: 2 }]; respond(list);
    expect(await getEpisodes(['1', '2'])).toEqual(list);
    expect(fetchMock).toHaveBeenCalledWith('https://rickandmortyapi.com/api/episode/1,2');
  });
  it.each([
    ['list', () => getCharacters(), 'Failed to fetch characters'],
    ['detail', () => getCharacter('1'), 'Failed to fetch character details'],
    ['episodes', () => getEpisodes(['1']), 'Failed to fetch episodes'],
  ] as const)('rejects HTTP failure for %s', async (_label, request, message) => {
    respond({}, false); await expect(request()).rejects.toThrow(message);
  });
  it('propagates network failure', async () => {
    fetchMock.mockRejectedValue(new Error('Offline'));
    await expect(getCharacters()).rejects.toThrow('Offline');
  });
  it('propagates malformed JSON', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => { throw new SyntaxError('Invalid JSON'); } });
    await expect(getCharacter('1')).rejects.toThrow('Invalid JSON');
  });
});
