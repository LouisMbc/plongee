'use client';

import { useEffect, useState } from 'react';
import PoissonCard from '@/components/PoissonCard';

interface Poisson {
  Species: string[];
  Genus: string[];
  FBname: string[] | null[];
  SpecCode: number[];
  ImageURL: string[];
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
      const res = await fetch(`http://localhost:3001/api/poissons?page=${page}&limit=12`);
      const data = await res.json();

      if (res.ok) {
        setPoissons(data.poissons.species || []);
        setTotal(data.poissons.total[0] || 0); // total est un tableau maintenant
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && poissons.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🐟</div>
          <p className="text-xl text-gray-600">Chargement des poissons...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-blue-900">Catalogue des Poissons</h1>
          <p className="text-gray-600 text-lg">
            Découvrez <span className="font-bold text-blue-600">{total.toLocaleString()}</span> espèces marines
          </p>
        </div>

        {/* Grille de cartes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {poissons.map((poisson, index) => (
            <PoissonCard
              key={`${poisson.SpecCode[0]}-${index}`}
              species={poisson.Species[0]}
              genus={poisson.Genus[0]}
              commonName={poisson.FBname[0]}
              specCode={poisson.SpecCode[0]}
              imageUrl={poisson.ImageURL[0]}
            />
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-12 flex justify-center items-center gap-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            ← Précédent
          </button>
          
          <div className="px-6 py-3 bg-white rounded-lg shadow-lg font-semibold text-blue-600">
            Page {page}
          </div>
          
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={loading || poissons.length < 12}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            Suivant →
          </button>
        </div>

        {/* Loader pendant pagination */}
        {loading && (
          <div className="fixed bottom-4 right-4 bg-white shadow-xl rounded-full p-4">
            <div className="animate-spin text-3xl">🐠</div>
          </div>
        )}
      </div>
    </main>
  );
}
