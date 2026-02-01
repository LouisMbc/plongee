'use client';

import { useEffect, useState } from 'react';
import PoissonCard from '@/components/PoissonCard';

interface Poisson {
  id: string;
  nom: string;
  image: string | null;
}

export default function PoissonsPage() {
  const [poissons, setPoissons] = useState<Poisson[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadPoissons();
  }, [page]);

  const loadPoissons = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/especes?page=${page}&limit=12`);
      const data = await res.json();

      if (res.ok) {
        setPoissons(data.especes || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && poissons.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-blue-800 font-medium">Chargement des espèces marines...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Catalogue des Espèces Marines</h1>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 mb-4"></div>
          <p className="text-gray-600 text-lg">
            Explorez notre base de données de <span className="font-bold text-blue-700">{total.toLocaleString()}</span> espèces
          </p>
        </div>

        {/* Grille de cartes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {poissons.map((poisson, index) => (
            <PoissonCard
              key={`${poisson.id}-${index}`}
              species={poisson.nom}
              genus=""
              commonName={null}
              specCode={poisson.id}
              imageUrl={poisson.image || ''}
            />
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-12 flex justify-center items-center gap-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-semibold"
          >
            ← Précédent
          </button>
          
          <div className="px-8 py-3 bg-white rounded-lg shadow-lg font-bold text-blue-700 border-2 border-blue-200">
            Page {page}
          </div>
          
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={loading || poissons.length < 12}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-semibold"
          >
            Suivant →
          </button>
        </div>

        {/* Loader pendant pagination */}
        {loading && (
          <div className="fixed bottom-8 right-8 bg-white shadow-2xl rounded-full p-4 border-2 border-cyan-500">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </main>
  );
}
