'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Poisson {
  id: string;
  nom: string;
  image: string | null;
}

interface EspeceAjoutee {
  id: string;
  nom: string;
}

export default function AddEspecesPage() {
  const params = useParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [poissons, setPoissons] = useState<Poisson[]>([]);
  const [especesAjoutees, setEspecesAjoutees] = useState<EspeceAjoutee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Debounce de 500ms pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      if (page !== 1) {
        setPage(1); // Réinitialiser à la page 1 lors d'une nouvelle recherche
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadPoissons();
  }, [page, debouncedSearch]);

  useEffect(() => {
    loadEspecesAjoutees();
  }, []);

  const loadPoissons = async () => {
    const isSearch = debouncedSearch.length > 0;
    if (isSearch) {
      setSearching(true);
    } else {
      setLoading(true);
    }
    
    try {
      let url = `http://localhost:3001/api/especes?page=${page}&limit=12`;
      if (debouncedSearch) {
        url += `&search=${encodeURIComponent(debouncedSearch)}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok) {
        setPoissons(data.especes || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 0);
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
      setSearching(false);
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
        body: JSON.stringify({ nom: poisson.nom, id_espece: poisson.id })
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
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-blue-800 font-medium">Chargement...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Ajouter des Espèces</h1>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 mb-4"></div>
          <p className="text-gray-600 text-lg">Sélectionnez les espèces marines observées lors de cette plongée</p>
        </div>

        {/* Espèces observées */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-blue-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-blue-900">Espèces Observées</h2>
            <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full text-sm font-semibold shadow-md">
              {especesAjoutees.length}
            </span>
          </div>
          {especesAjoutees.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 font-medium">Aucune espèce observée pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {especesAjoutees.map((e) => (
                <div key={e.id} className="px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg text-sm font-medium text-blue-800 border border-blue-200 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="truncate">{e.nom}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recherche */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-blue-100">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Rechercher une Espèce</h2>
          <div className="relative">
            <svg className="absolute left-4 top-4 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher par nom d'espèce..."
              className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searching && (
              <div className="absolute right-4 top-4">
                <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <p className="text-gray-600">
              <span className="font-semibold text-blue-700">{total}</span> résultat{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
            </p>
            <p className="text-gray-500">
              {searchQuery && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                  &quot;{searchQuery}&quot;
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Liste des poissons */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {poissons.map((p, i) => (
              <div key={`${p.id}-${i}`} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-blue-100 group">
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-cyan-100 overflow-hidden">
                  {p.image && p.image !== '' ? (
                    <img
                      src={p.image}
                      alt={p.nom}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-20 h-20 text-blue-300 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-lg mb-4 text-blue-900 truncate group-hover:text-blue-700 transition-colors" title={p.nom}>
                    {p.nom}
                  </h3>

                  <button
                    onClick={() => handleAddEspece(p)}
                    disabled={especesAjoutees.some(e => e.nom === p.nom)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {especesAjoutees.some(e => e.nom === p.nom) ? (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Ajoutée
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Ajouter
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mb-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-semibold"
            >
              ← Précédent
            </button>
            <div className="px-8 py-3 bg-white rounded-lg shadow-lg font-bold text-blue-700 border-2 border-blue-200">
              Page {page} / {totalPages}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-semibold"
            >
              Suivant →
            </button>
          </div>
        )}

        {/* Bouton Terminer */}
        <div className="flex justify-center">
          <button
            onClick={() => router.push('/')}
            className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl text-lg flex items-center"
          >
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Terminer
          </button>
        </div>
      </div>
    </main>
  );
}
