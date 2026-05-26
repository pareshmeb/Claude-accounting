import '@testing-library/jest-dom/vitest';

// Global fetch mock
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
    ok: true,
  })
);

// Mock better-sqlite3
vi.mock('better-sqlite3', () => {
  const mockStatement = {
    run: vi.fn(),
    get: vi.fn(),
    all: vi.fn(() => []),
  };
  const mockDb = {
    pragma: vi.fn(),
    exec: vi.fn(),
    prepare: vi.fn(() => mockStatement),
    transaction: vi.fn((fn) => fn),
  };
  return { default: vi.fn(() => mockDb) };
});
