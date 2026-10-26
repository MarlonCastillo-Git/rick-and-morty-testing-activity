import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CharacterCard from '@/components/CharacterCard';
import Pagination from '@/components/Pagination';
import Loading from '@/app/loading';
import ErrorView from '@/app/error';
import { character } from './fixtures';
import type { Character } from '@/types/rickandmorty';

describe('CharacterCard', () => {
  it('shows identifying data and navigates to the correct detail', () => {
    render(<CharacterCard character={character} />);
    expect(screen.getByRole('heading', { name: 'Rick Sanchez' })).toBeVisible();
    expect(screen.getByRole('img', { name: 'Rick Sanchez' })).toHaveAttribute('src');
    expect(screen.getByRole('link')).toHaveAttribute('href', '/character/1');
    expect(screen.getByText('Alive - Human')).toBeVisible();
    expect(screen.getByText('Citadel of Ricks')).toBeVisible();
  });
  it.each(['Alive', 'Dead', 'unknown'] as const)('displays status %s', (status) => {
    render(<CharacterCard character={{ ...character, status }} />);
    expect(screen.getByText(`${status} - Human`)).toBeVisible();
  });
  it('uses a neutral indicator for an unexpected API status', () => {
    render(<CharacterCard character={{ ...character, status: 'unexpected' as Character['status'] }} />);
    expect(screen.getByText('unexpected - Human').previousElementSibling).toHaveClass('bg-gray-500');
  });
});
describe('Pagination', () => {
  it.each([
    [1, 3, null, '/?page=2'], [2, 3, '/?page=1', '/?page=3'],
    [3, 3, '/?page=2', null], [1, 1, null, null],
  ] as const)('handles page %s of %s', (currentPage, totalPages, prev, next) => {
    render(<Pagination currentPage={currentPage} totalPages={totalPages} />);
    expect(screen.getByText(`Page ${currentPage} of ${totalPages}`)).toBeVisible();
    for (const [name, href] of [[/Previous/, prev], [/Next/, next]] as const) {
      if (href) expect(screen.getByRole('link', { name })).toHaveAttribute('href', href);
      else expect(screen.queryByRole('link', { name })).not.toBeInTheDocument();
    }
  });
});
it('announces the loading state', () => {
  render(<Loading />);
  expect(screen.getByRole('status', { name: 'Loading characters' })).toBeVisible();
});
it('shows a safe error and invokes recovery only on click', async () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  const reset = vi.fn(); const error = new Error('Internal diagnostic');
  render(<ErrorView error={error} reset={reset} />);
  expect(screen.getByRole('heading', { name: 'Something went wrong!' })).toBeVisible();
  expect(screen.queryByText('Internal diagnostic')).not.toBeInTheDocument();
  expect(log).toHaveBeenCalledWith(error); expect(reset).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(reset).toHaveBeenCalledTimes(1);
});
