/// <reference types="jest" />
import '@testing-library/jest-dom';

// Mock global de window.location pour éviter les erreurs JSDOM
const mockLocation = {
  href: 'http://localhost',
  origin: 'http://localhost',
  protocol: 'http:',
  host: 'localhost',
  hostname: 'localhost',
  port: '',
  pathname: '/',
  search: '',
  hash: '',
  reload: jest.fn(),
  replace: jest.fn(),
  assign: jest.fn(),
  toString: () => 'http://localhost',
};

delete (window as Partial<Window>).location;
(window as unknown as { location: typeof mockLocation }).location = mockLocation;

// Supprimer les warnings JSDOM pour les tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Not implemented: navigation')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
