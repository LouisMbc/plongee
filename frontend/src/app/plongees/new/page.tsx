'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPlongeePage() {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    date: '',
    type: '',
    profondeur: '',
    temps: '',
    lieu: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/plongees', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          titre: formData.titre,
          description: formData.description || undefined,
          date: formData.date,
          type: formData.type || undefined,
          profondeur: formData.profondeur ? Number(formData.profondeur) : undefined,
          temps: formData.temps ? Number(formData.temps) : undefined,
          lieu: formData.lieu || undefined,
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Rediriger vers la page d'ajout des espèces
        router.push(`/plongees/${data.plongee.id}/especes`);
      } else {
        setError(data.error || 'Erreur lors de la création');
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Nouvelle Plongée</h1>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 mb-4"></div>
          <p className="text-gray-600">Enregistrez les détails de votre plongée</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg shadow-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                minLength={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                value={formData.titre}
                onChange={(e) => setFormData({...formData, titre: e.target.value})}
                placeholder="Ex: Plongée à la Grotte Bleue"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Décrivez votre plongée, les conditions, vos observations..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type de plongée</label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="">-- Sélectionnez --</option>
                  <option value="Exploration">Exploration</option>
                  <option value="Formation">Formation</option>
                  <option value="Technique">Technique</option>
                  <option value="Épave">Épave</option>
                  <option value="Grotte">Grotte</option>
                  <option value="Dérive">Dérive</option>
                  <option value="Nuit">Nuit</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Profondeur (mètres)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    value={formData.profondeur}
                    onChange={(e) => setFormData({...formData, profondeur: e.target.value})}
                    placeholder="Ex: 25"
                  />
                  <span className="absolute right-4 top-3 text-gray-400 font-medium">m</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Durée (minutes)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    value={formData.temps}
                    onChange={(e) => setFormData({...formData, temps: e.target.value})}
                    placeholder="Ex: 45"
                  />
                  <span className="absolute right-4 top-3 text-gray-400 font-medium">min</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Lieu</label>
              <input
                type="text"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                value={formData.lieu}
                onChange={(e) => setFormData({...formData, lieu: e.target.value})}
                placeholder="Ex: Marseille, Calanques"
              />
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-400 font-semibold shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Enregistrement...
                  </span>
                ) : (
                  'Suivant : Ajouter des espèces →'
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-8 py-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 font-semibold"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Astuce :</span> Après avoir enregistré votre plongée, vous pourrez ajouter les espèces marines observées.
          </p>
        </div>
      </div>
    </main>
  );
}
