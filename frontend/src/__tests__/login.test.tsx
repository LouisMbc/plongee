/// <reference types="jest" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../app/login/page';
import '@testing-library/jest-dom';

describe('LoginPage', () => {
  beforeEach(() => {
    // Nettoyer les mocks avant chaque test
    jest.clearAllMocks();
    // Mock window.location.href pour éviter la redirection réelle
    delete (window as Partial<Window>).location;
    (window as Partial<Window>).location = { href: '' } as Location;
    // Mock localStorage
    const localStorageMock = (function () {
      let store: Record<string, string> = {};
      return {
        getItem(key: string) { return store[key] || null; },
        setItem(key: string, value: string) { store[key] = value.toString(); },
        clear() { store = {}; },
        removeItem(key: string) { delete store[key]; }
      };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  it('affiche le formulaire de connexion', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: /Se connecter/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Pseudo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Se connecter/i })).toBeInTheDocument();
  });

  it('met à jour les champs du formulaire', () => {
    render(<LoginPage />);
    const pseudoInput = screen.getByLabelText(/Pseudo/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/Mot de passe/i) as HTMLInputElement;

    fireEvent.change(pseudoInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'secret' } });

    expect(pseudoInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('secret');
  });

  it('affiche une erreur si la connexion échoue', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Identifiants invalides' }),
    } as unknown as Response);

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Pseudo/i), { target: { value: 'baduser' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: 'badpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    await waitFor(() => {
      expect(screen.getByText(/Identifiants invalides/i)).toBeInTheDocument();
    });
  });

  it('stocke le token et redirige si la connexion réussit', async () => {
    const fakeToken = 'abc123';
    const fakeUser = { pseudo: 'gooduser' };
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: fakeToken, user: fakeUser }),
    } as unknown as Response);

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Pseudo/i), { target: { value: 'gooduser' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: 'goodpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    await waitFor(() => {
      expect(window.localStorage.getItem('token')).toBe(fakeToken);
      expect(window.localStorage.getItem('user')).toBe(JSON.stringify(fakeUser));
      expect(window.location.href).toBe('http://localhost/');
    });
  });

  it('affiche une erreur si le serveur ne répond pas', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Pseudo/i), { target: { value: 'any' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: 'any' } });
    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    await waitFor(() => {
      expect(screen.getByText(/Erreur de connexion au serveur/i)).toBeInTheDocument();
    });
  });
});
