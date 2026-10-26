import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import Home from '@/app/page';
import CharacterPage from '@/app/character/[id]/page';
import RootLayout, { metadata } from '@/app/layout';
import { getCharacters, getCharacter, getEpisodes } from '@/lib/api';
import { character, characters, episode } from './fixtures';
vi.mock('@/lib/api', () => ({ getCharacters: vi.fn(), getCharacter: vi.fn(), getEpisodes: vi.fn() }));
beforeEach(() => {
  vi.mocked(getCharacters).mockResolvedValue(characters);
  vi.mocked(getCharacter).mockResolvedValue(character);
  vi.mocked(getEpisodes).mockResolvedValue([episode]);
});
// Invoke async server functions explicitly; this does not emulate the RSC transport.
describe('Home server orchestration', () => {
  it.each([undefined, '2', 'invalid', ['2']])('loads and renders page parameter %j', async (page) => {
    render(await Home({ searchParams: Promise.resolve({ page }) }));
    expect(getCharacters).toHaveBeenCalledExactlyOnceWith(page === '2' ? 2 : 1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Rick and Morty Characters');
    expect(screen.getByRole('heading', { name: character.name })).toBeVisible();
    expect(screen.getByText(`Page ${page === '2' ? 2 : 1} of 3`)).toBeVisible();
  });
  it('renders an empty result', async () => {
    vi.mocked(getCharacters).mockResolvedValue({ ...characters, results: [] });
    render(await Home({ searchParams: Promise.resolve({}) }));
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
  it('propagates failure to the Next error boundary', async () => {
    vi.mocked(getCharacters).mockRejectedValue(new Error('API failure'));
    await expect(Home({ searchParams: Promise.resolve({}) })).rejects.toThrow('API failure');
  });
});
describe('Character detail server orchestration', () => {
  it.each(['Alive', 'Dead', 'unknown'] as const)('renders full detail with status %s', async (status) => {
    vi.mocked(getCharacter).mockResolvedValue({ ...character, status });
    render(await CharacterPage({ params: Promise.resolve({ id: '1' }) }));
    expect(getCharacter).toHaveBeenCalledExactlyOnceWith('1');
    expect(getEpisodes).toHaveBeenCalledExactlyOnceWith(['1']);
    expect(screen.getByRole('heading', { name: character.name })).toBeVisible();
    expect(screen.getByText(`${status} - Human`)).toBeVisible();
    expect(screen.getByText('Unknown')).toBeVisible();
    expect(screen.getByText('Male')).toBeVisible();
    expect(screen.getByText('Earth C-137')).toBeVisible();
    expect(screen.getByText('Citadel of Ricks')).toBeVisible();
    expect(screen.getByText('November 4, 2017')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Episodes (1)' })).toBeVisible();
    expect(screen.getByText('S01E01')).toHaveAttribute('title', 'Pilot - December 2, 2013');
    expect(screen.getByRole('link', { name: /Back to Characters/ })).toHaveAttribute('href', '/');
  });
  it('shows an explicit type and no episodes', async () => {
    vi.mocked(getCharacter).mockResolvedValue({ ...character, type: 'Robot', episode: [] });
    vi.mocked(getEpisodes).mockResolvedValue([]);
    render(await CharacterPage({ params: Promise.resolve({ id: '1' }) }));
    expect(screen.getByText('Robot')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Episodes (0)' })).toBeVisible();
    expect(getEpisodes).toHaveBeenCalledWith([]);
  });
  it('does not load episodes when character fetch fails', async () => {
    vi.mocked(getCharacter).mockRejectedValue(new Error('Missing character'));
    await expect(CharacterPage({ params: Promise.resolve({ id: '404' }) })).rejects.toThrow('Missing character');
    expect(getEpisodes).not.toHaveBeenCalled();
  });
  it('propagates an episode error', async () => {
    vi.mocked(getEpisodes).mockRejectedValue(new Error('Episode failure'));
    await expect(CharacterPage({ params: Promise.resolve({ id: '1' }) })).rejects.toThrow('Episode failure');
  });
});
it('renders the document language, navigation, content and metadata', () => {
  const html = renderToStaticMarkup(<RootLayout><p>Child content</p></RootLayout>);
  const document = new DOMParser().parseFromString(html, 'text/html');
  expect(document.documentElement.lang).toBe('en');
  expect(document.querySelector('main')?.textContent).toContain('Child content');
  expect(document.querySelector('nav a')?.getAttribute('href')).toBe('/');
  expect(document.querySelector('footer')?.textContent).toContain('The Rick and Morty API');
  expect(document.querySelector('a[target="_blank"]')?.getAttribute('rel')).toBe('noopener noreferrer');
  expect(metadata.title).toBe('Rick and Morty Explorer');
  expect(metadata.description).toBe('Explore the Rick and Morty universe');
});
