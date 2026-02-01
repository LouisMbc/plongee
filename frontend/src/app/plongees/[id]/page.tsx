'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

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

interface Espece {
  id: string;
  nom: string;
  image: string | null;
}

export default function PlongeePage() {
  const params = useParams();
  const router = useRouter();
  const [plongee, setPlongee] = useState<Plongee | null>(null);
  const [especes, setEspeces] = useState<Espece[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlongee();
    loadEspeces();
  }, []);

  const loadPlongee = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/plongees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        const found = data.plongees.find((p: Plongee) => p.id === params.id);
        setPlongee(found || null);
      }
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const loadEspeces = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:3001/api/plongees/${params.id}/especes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setEspeces(data.especes || []);
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
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

  if (!plongee) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md border border-blue-100">
          <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Plongée introuvable</h2>
          <p className="text-gray-600 mb-6">Cette plongée n'existe pas ou a été supprimée</p>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 font-semibold shadow-lg"
          >
            Retour à l'accueil
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Bouton retour */}
        <button
          onClick={() => router.push('/')}
          className="mb-8 px-6 py-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center text-gray-700 hover:text-blue-700 font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour
        </button>

        {/* Détails de la plongée */}
        <div className="bg-white rounded-2xl shadow-xl p-10 mb-8 border border-blue-100">
          <h1 className="text-4xl font-bold mb-3 text-blue-900">{plongee.titre}</h1>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 mb-6"></div>
          {plongee.description && (
            <p className="text-lg text-gray-600 italic mb-8 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              {plongee.description}
            </p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Date */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl border border-blue-200">
              <div className="flex items-center mb-2">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-semibold text-gray-600">Date</span>
              </div>
              <p className="text-lg font-bold text-blue-900">
                {new Date(plongee.date).toLocaleDateString('fr-FR', { 
                  day: 'numeric',
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>

            {/* Lieu */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl border border-blue-200">
              <div className="flex items-center mb-2">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-semibold text-gray-600">Lieu</span>
              </div>
              <p className="text-lg font-bold text-blue-900">{plongee.lieu}</p>
            </div>

            {/* Type */}
            {plongee.type && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl border border-blue-200">
                <div className="flex items-center mb-2">
                  <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-600">Type</span>
                </div>
                <p className="text-lg font-bold text-blue-900">{plongee.type}</p>
              </div>
            )}

            {/* Profondeur */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl border border-blue-200">
              <div className="flex items-center mb-2">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span className="text-sm font-semibold text-gray-600">Profondeur</span>
              </div>
              <p className="text-lg font-bold text-blue-900">{plongee.profondeur} mètres</p>
            </div>

            {/* Durée */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl border border-blue-200">
              <div className="flex items-center mb-2">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-gray-600">Durée</span>
              </div>
              <p className="text-lg font-bold text-blue-900">{plongee.temps} minutes</p>
            </div>
          </div>
        </div>

        {/* Espèces observées */}
        <div className="bg-white rounded-2xl shadow-xl p-10 border border-blue-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-blue-900 mb-2">Espèces Observées</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full text-sm font-semibold shadow-md">
                {especes.length} espèce{especes.length > 1 ? 's' : ''}
              </span>
              <button
                onClick={() => router.push(`/plongees/${params.id}/especes`)}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Ajouter des espèces
              </button>
            </div>
          </div>

          {especes.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl">
              <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-xl font-bold text-gray-700 mb-2">Aucune espèce observée</h3>
              <p className="text-gray-600 mb-6">Commencez à documenter vos observations marines</p>
              <button
                onClick={() => router.push(`/plongees/${params.id}/especes`)}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Ajouter des espèces
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {especes.map((e) => (
                <div key={e.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-100 group">
                  <div className="relative h-48 bg-gradient-to-br from-blue-100 to-cyan-100 overflow-hidden">
                    {e.image && e.image !== '' ? (
                      <img
                        src={e.image}
                        alt={e.nom}
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
                  <div className="p-4 bg-gradient-to-b from-white to-gray-50">
                    <h3 className="font-bold text-lg text-blue-900 truncate group-hover:text-blue-700 transition-colors" title={e.nom}>
                      {e.nom}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
