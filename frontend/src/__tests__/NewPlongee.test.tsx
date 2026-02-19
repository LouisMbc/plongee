import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewPlongeePage from '../app/plongees/new/page';
import AddEspecesPage from '../app/plongees/[id]/especes/page';
import '@testing-library/jest-dom';

// Mock de useRouter et useParams
const mockPush = jest.fn();
const mockParams = { id: 'plongee-123' };

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => mockParams,
}));

// Mock de localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock de fetch
global.fetch = jest.fn();

describe('Workflow Plongée - Création et Ajout d\'Espèces', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Création d\'une plongée', () => {
    it('affiche le formulaire de création', () => {
      render(<NewPlongeePage />);
      
      expect(screen.getByText('Nouvelle Plongée')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Plongée à la Grotte Bleue/i)).toBeInTheDocument();
    });

    it('redirige vers /login si pas de token', async () => {
      render(<NewPlongeePage />);
      
      const titreInput = screen.getByPlaceholderText(/Plongée à la Grotte Bleue/i);
      fireEvent.change(titreInput, { target: { value: 'Test' } });
      
      const form = titreInput.closest('form');
      if (form) {
        fireEvent.submit(form);
      }
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('crée une plongée avec succès', async () => {
      localStorageMock.setItem('token', 'fake-token');
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          plongee: {
            id: 'plongee-123',
            titre: 'Ma plongée',
          },
        }),
      });

      render(<NewPlongeePage />);
      
      const titreInput = screen.getByPlaceholderText(/Plongée à la Grotte Bleue/i);
      fireEvent.change(titreInput, { target: { value: 'Ma plongée' } });
      
      const form = titreInput.closest('form');
      if (form) {
        fireEvent.submit(form);
      }
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/plongees/plongee-123/especes');
      });
    });

    it('affiche une erreur de validation', async () => {
      localStorageMock.setItem('token', 'fake-token');
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Le titre est trop court',
        }),
      });

      render(<NewPlongeePage />);
      
      const titreInput = screen.getByPlaceholderText(/Plongée à la Grotte Bleue/i);
      fireEvent.change(titreInput, { target: { value: 'AB' } });
      
      const form = titreInput.closest('form');
      if (form) {
        fireEvent.submit(form);
      }
      
      await waitFor(() => {
        expect(screen.getByText(/Le titre est trop court/i)).toBeInTheDocument();
      });
    });

    it('affiche une erreur réseau', async () => {
      localStorageMock.setItem('token', 'fake-token');
      
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<NewPlongeePage />);
      
      const titreInput = screen.getByPlaceholderText(/Plongée à la Grotte Bleue/i);
      fireEvent.change(titreInput, { target: { value: 'Test' } });
      
      const form = titreInput.closest('form');
      if (form) {
        fireEvent.submit(form);
      }
      
      await waitFor(() => {
        expect(screen.getByText(/Erreur de connexion/i)).toBeInTheDocument();
      });
    });
  });

  describe('Ajout d\'espèces à une plongée', () => {
    const mockEspeces = [
      { id: 'espece-1', nom: 'Mérou brun', image: null },
      { id: 'espece-2', nom: 'Poisson-clown', image: null },
    ];

    it('affiche la liste des espèces disponibles', async () => {
      localStorageMock.setItem('token', 'fake-token');
      
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ especes: mockEspeces, total: 2, totalPages: 1 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ especes: [] }),
        });

      render(<AddEspecesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Ajouter des Espèces')).toBeInTheDocument();
        expect(screen.getByText('Mérou brun')).toBeInTheDocument();
        expect(screen.getByText('Poisson-clown')).toBeInTheDocument();
      });
    });

    it('ajoute une espèce à la plongée', async () => {
      localStorageMock.setItem('token', 'fake-token');
      
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ especes: mockEspeces, total: 2, totalPages: 1 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ especes: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Espèce ajoutée' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ especes: [mockEspeces[0]] }),
        });

      render(<AddEspecesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Mérou brun')).toBeInTheDocument();
      });
      
      const addButtons = screen.getAllByRole('button', { name: /ajouter/i });
      fireEvent.click(addButtons[0]);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/plongees/plongee-123/especes',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Authorization': 'Bearer fake-token',
            }),
          })
        );
      });
    });

    it('empêche d\'ajouter une espèce déjà ajoutée', async () => {
      localStorageMock.setItem('token', 'fake-token');
      
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ especes: mockEspeces, total: 2, totalPages: 1 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ especes: [mockEspeces[0]] }),
        });

      render(<AddEspecesPage />);
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        const ajouteeButton = buttons.find(btn => btn.textContent?.includes('Ajoutée'));
        expect(ajouteeButton).toBeDisabled();
      });
    });

    it('permet de rechercher des espèces', async () => {
      localStorageMock.setItem('token', 'fake-token');
      
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ especes: mockEspeces, total: 2, totalPages: 1 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ especes: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ especes: [mockEspeces[0]], total: 1, totalPages: 1 }),
        });

      render(<AddEspecesPage />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Rechercher/i)).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText(/Rechercher/i);
      fireEvent.change(searchInput, { target: { value: 'mérou' } });
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('search=m%C3%A9rou')
        );
      }, { timeout: 1000 });
    });

    it('redirige vers l\'accueil en cliquant sur Terminer', async () => {
      localStorageMock.setItem('token', 'fake-token');
      
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ especes: mockEspeces, total: 2, totalPages: 1 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ especes: [] }),
        });

      render(<AddEspecesPage />);
      
      await waitFor(() => {
        const terminerButton = screen.getByRole('button', { name: /terminer/i });
        fireEvent.click(terminerButton);
      });
      
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('redirige vers /login sans token', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ especes: mockEspeces, total: 2, totalPages: 1 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ especes: [] }),
        });

      render(<AddEspecesPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Poisson-clown')).toBeInTheDocument();
      });
      
      const addButtons = screen.getAllByRole('button', { name: /ajouter/i });
      fireEvent.click(addButtons[0]);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });
  });
});
