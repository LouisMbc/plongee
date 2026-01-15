'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Poisson {
  Species: string;
  Genus: string;
  FBname?: string;
  SpecCode: number;
  ImageURL?: string;
}

interface EspeceAjoutee {
  id: string;
  nom: string;
}

export default function AddEspecesPage() {
  const params = useParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [poissons, setPoissons] = useState<Poisson[]>([]);
  const [filteredPoissons, setFilteredPoissons] = useState<Poisson[]>([]);
  const [especesAjoutees, setEspecesAjoutees] = useState<EspeceAjoutee[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadPoissons();
  }, [page]);

  useEffect(() => {
    loadEspecesAjoutees();
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const query = searchQuery.toLowerCase();
      const filtered = poissons.filter(p => 
        p.Species?.toLowerCase().includes(query) ||
        p.Genus?.toLowerCase().includes(query) ||
        p.FBname?.toLowerCase().includes(query)
      );
      setFilteredPoissons(filtered);
    } else {
      setFilteredPoissons(poissons);
    }
  }, [searchQuery, poissons]);

  const loadPoissons = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/poissons?page=${page}&limit=50`);
      const data = await res.json();
      
      if (res.ok && data.poissons.species) {
        setPoissons(data.poissons.species);
        setFilteredPoissons(data.poissons.species);
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEspecesAjoutees = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:3001/api/plongees/${params.id}/especes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setEspecesAjoutees(data.especes || []);
      }
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const handleAddEspece = async (poisson: Poisson) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/api/plongees/${params.id}/especes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nom: poisson.Species })
      });

      if (res.ok) {
        await loadEspecesAjoutees();
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur');
      }
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-6xl animate-bounce">🐟</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🐟 Ajouter des espèces</h1>

        {/* Espèces observées */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Espèces observées ({especesAjoutees.length})</h2>
          {especesAjoutees.length === 0 ? (
            <p className="text-gray-500">Aucune espèce ajoutée</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {especesAjoutees.map((e) => (
                <div key={e.id} className="p-2 bg-blue-50 rounded text-sm">
                  <span className="text-blue-600">✓</span> {e.nom}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Barre de recherche */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <input
            type="text"
            placeholder="Filtrer les 50 poissons de cette page..."
            className="w-full px-4 py-3 border rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-2">
            {filteredPoissons.length} résultat(s) • Page {page}
          </p>
        </div>

        {/* Liste des poissons avec bouton Ajouter à la place de Détails */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {filteredPoissons.map((p, i) => (
            <div key={`${p.SpecCode}-${i}`} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all">
              <div className="relative h-48 bg-gradient-to-br from-blue-100 to-cyan-100">
                {p.ImageURL && p.ImageURL !== 'NA' ? (
                  <img
                    src={p.ImageURL}
                    alt={p.Species}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-7xl opacity-50">🐠</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  #{p.SpecCode}
                </div>
              </div>

              <div className="p-4 bg-gradient-to-b from-white to-gray-50">
                <h3 className="font-bold text-lg mb-1 text-blue-800 italic truncate" title={p.Species}>
                  {p.Species}
                </h3>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Genre:</span>
                    <span className="font-semibold text-gray-700">{p.Genus}</span>
                  </div>
                  
                  {p.FBname && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Nom commun:</span>
                      <span className="text-gray-700 truncate" title={p.FBname}>
                        {p.FBname}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleAddEspece(p)}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
                >
                  ➕ Ajouter à ma plongée
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            ← Précédent
          </button>
          <span className="px-6 py-2 bg-white rounded-lg shadow">Page {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Suivant →
          </button>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            ✓ Terminer
          </button>
        </div>
      </div>
    </main>
  );
}
