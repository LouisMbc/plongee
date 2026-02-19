'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Plongee {
  id: string;
  titre: string;
  description: string | null;
  lieu: string;
  date: string;
  type: string | null;
  profondeur: number;
  temps: number;
}

interface User {
  id: string;
  pseudo: string;
  nom: string;
  prenom: string;
  admin?: boolean;
}

export default function Home() {
  const router = useRouter();
  const [plongees, setPlongees] = useState<Plongee[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadPlongees();
  }, []);

  const loadPlongees = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/plongees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setPlongees(data.plongees || []);
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-300 text-lg">Chargement...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900">
        <div className="max-w-5xl mx-auto py-32 px-4 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 shadow-2xl border border-cyan-500/30">
            <h1 className="text-6xl font-bold mb-4 text-white">DIVE LOG</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto mb-6"></div>
            <p className="text-2xl text-cyan-200 mb-12 font-light">Votre carnet de plongée numérique</p>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Suivez vos plongées, recensez les espèces marines observées et partagez vos découvertes sous-marines
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/login')}
                className="px-8 py-3 bg-transparent border-2 border-cyan-500 text-cyan-300 rounded-lg hover:bg-cyan-500 hover:text-white transition-all duration-300 font-semibold"
              >
                Connexion
              </button>
              <button
                onClick={() => router.push('/register')}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 font-semibold shadow-lg"
              >
                Créer un compte
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Mes Plongées</h1>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
        </div>

        {plongees.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center border border-blue-100">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Aucune plongée enregistrée</h2>
            <p className="text-gray-500 text-lg">Commencez à documenter vos aventures sous-marines</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plongees.map((p) => (
              <div
                key={p.id}
                onClick={() => router.push(`/plongees/${p.id}`)}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-blue-100 cursor-pointer group"
              >
                {/* En-tête de carte avec dégradé */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-5 text-white">
                  <h3 className="text-xl font-bold mb-1 group-hover:text-cyan-200 transition-colors">{p.titre}</h3>
                  {p.description && (
                    <p className="text-sm text-blue-100 italic line-clamp-2">{p.description}</p>
                  )}
                </div>

                {/* Contenu de la carte */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">{new Date(p.date).toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}</span>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-medium">{p.lieu}</span>
                  </div>

                  {p.type && (
                    <div className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="text-sm">{p.type}</span>
                    </div>
                  )}

                  <div className="flex gap-4 pt-3 border-t border-gray-200">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Profondeur</p>
                      <p className="text-lg font-bold text-blue-700">{p.profondeur}m</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Durée</p>
                      <p className="text-lg font-bold text-cyan-700">{p.temps} min</p>
                    </div>
                  </div>
                </div>

                {/* Barre de bas avec effet hover */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-5 py-3 border-t border-blue-100">
                  <p className="text-sm text-blue-600 font-medium group-hover:text-blue-800 transition-colors">
                    Voir les détails →
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
