import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../components/Header';
import '@testing-library/jest-dom';

// Mock de Next.js Link
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('Header Component', () => {
  let localStorageMock: Record<string, string>;
  const originalLocation = window.location;

  beforeAll(() => {
    // Mock window.location.href une seule fois
    delete (window as { location?: Location }).location;
    (window.location as unknown) = { href: 'http://localhost/' };
  });

  afterAll(() => {
    (window.location as unknown) = originalLocation;
  });

  beforeEach(() => {
    // Reset location href
    (window.location as { href: string }).href = 'http://localhost/';
    
    // Mock localStorage
    localStorageMock = {};
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => localStorageMock[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          localStorageMock[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete localStorageMock[key];
        }),
        clear: jest.fn(() => {
          localStorageMock = {};
        }),
      },
      writable: true,
    });
  });

  it('affiche le lien de connexion quand l\'utilisateur n\'est pas connecté', () => {
    render(<Header />);
    
    expect(screen.getByText('Se connecter')).toBeInTheDocument();
    expect(screen.getByText('S\'inscrire')).toBeInTheDocument();
  });

  it('affiche le nom de l\'utilisateur quand il est connecté', () => {
    const user = {
      id: 'user-123',
      pseudo: 'john_doe',
      nom: 'Doe',
      prenom: 'John',
      admin: false,
    };
    
    localStorageMock['user'] = JSON.stringify(user);
    
    render(<Header />);
    
    expect(screen.getByText(/Bonjour, john_doe/i)).toBeInTheDocument();
  });

  it('affiche les liens de navigation pour un utilisateur connecté', () => {
    const user = {
      id: 'user-123',
      pseudo: 'john_doe',
      nom: 'Doe',
      prenom: 'John',
      admin: false,
    };
    
    localStorageMock['user'] = JSON.stringify(user);
    
    render(<Header />);
    
    expect(screen.getByText('Poissons')).toBeInTheDocument();
    expect(screen.getByText('Nouvelle plongée')).toBeInTheDocument();
    expect(screen.getByText('Mon profil')).toBeInTheDocument();
    expect(screen.getByText('Déconnexion')).toBeInTheDocument();
  });

  it('affiche le lien Admin pour un administrateur', () => {
    const adminUser = {
      id: 'admin-123',
      pseudo: 'admin',
      nom: 'Admin',
      prenom: 'Super',
      admin: true,
    };
    
    localStorageMock['user'] = JSON.stringify(adminUser);
    
    render(<Header />);
    
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('ne affiche pas le lien Admin pour un utilisateur normal', () => {
    const user = {
      id: 'user-123',
      pseudo: 'john_doe',
      nom: 'Doe',
      prenom: 'John',
      admin: false,
    };
    
    localStorageMock['user'] = JSON.stringify(user);
    
    render(<Header />);
    
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('déconnecte l\'utilisateur et redirige vers la page d\'accueil', () => {
    const user = {
      id: 'user-123',
      pseudo: 'john_doe',
      nom: 'Doe',
      prenom: 'John',
      admin: false,
    };
    
    localStorageMock['user'] = JSON.stringify(user);
    localStorageMock['token'] = 'fake-token';
    
    render(<Header />);
    
    const logoutButton = screen.getByText('Déconnexion');
    fireEvent.click(logoutButton);
    
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('user');
    expect(window.location.href).toBe('http://localhost/');
  });

  it('gère correctement un localStorage avec des données invalides', () => {
    localStorageMock['user'] = 'invalid-json';
    
    // Ne devrait pas crasher
    render(<Header />);
    
    expect(screen.getByText('Se connecter')).toBeInTheDocument();
  });

  it('affiche le logo "Plongée"', () => {
    render(<Header />);
    
    expect(screen.getByText('Plongée')).toBeInTheDocument();
  });
});
