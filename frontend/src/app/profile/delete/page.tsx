'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  pseudo: string;
  nom: string;
  prenom: string;
}

export default function DeleteAccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch {
      router.push('/login');
    }
  }, [router]);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (confirmation !== 'SUPPRIMER') {
      setError('Veuillez taper "SUPPRIMER" pour confirmer');
      return;
    }

    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token || !user) {
      setError('Non authentifié');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/auth/delete-account', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (res.ok) {
        // Nettoyer le localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Rediriger vers la page d'accueil
        alert('Votre compte a été supprimé avec succès');
        window.location.href = '/';
      } else {
        setError(data.error || 'Erreur lors de la suppression');
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/profile')}
            className="text-blue-600 hover:underline"
          >
            ← Retour au profil
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-8 text-red-600">Supprimer mon compte</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">⚠️ Attention !</h2>
            <p className="text-red-700 text-sm mb-2">
              Cette action est <strong>irréversible</strong>. Une fois votre compte supprimé :
            </p>
            <ul className="list-disc list-inside text-red-700 text-sm space-y-1 ml-4">
              <li>Toutes vos données personnelles seront supprimées</li>
              <li>Toutes vos plongées enregistrées seront supprimées</li>
              <li>Vos observations d'espèces seront supprimées</li>
              <li>Vous ne pourrez pas récupérer ces données</li>
            </ul>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleDelete} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Confirmez votre mot de passe *
              </label>
              <input
                type="password"
                required
                className="w-full px-3 py-2 border rounded-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Tapez "SUPPRIMER" pour confirmer *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border rounded-md"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder="SUPPRIMER"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tapez exactement "SUPPRIMER" en majuscules
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || confirmation !== 'SUPPRIMER'}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:bg-gray-400"
              >
                {loading ? 'Suppression...' : 'Supprimer définitivement mon compte'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/profile')}
                className="px-6 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
