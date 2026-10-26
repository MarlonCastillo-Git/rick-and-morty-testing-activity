import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

afterEach(cleanup);

// External requests must be explicitly mocked in each test.
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Unexpected network request'); }));
});

// Font loading belongs to the Next.js build, not the unit under test.
vi.mock('next/font/google', () => ({
  Geist: () => ({ variable: '--font-geist-sans' }),
  Geist_Mono: () => ({ variable: '--font-geist-mono' }),
}));
