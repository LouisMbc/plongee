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
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">➕ Nouvelle plongée</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Titre *</label>
              <input
                type="text"
                required
                minLength={3}
                className="w-full px-3 py-2 border rounded-md"
                value={formData.titre}
                onChange={(e) => setFormData({...formData, titre: e.target.value})}
                placeholder="Ex: Plongée à la Grotte Bleue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Décrivez votre plongée..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date *</label>
              <input
                type="datetime-local"
                required
                className="w-full px-3 py-2 border rounded-md"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type de plongée</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Profondeur (m)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.profondeur}
                  onChange={(e) => setFormData({...formData, profondeur: e.target.value})}
                  placeholder="Ex: 25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Temps (min)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.temps}
                  onChange={(e) => setFormData({...formData, temps: e.target.value})}
                  placeholder="Ex: 45"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Lieu</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                value={formData.lieu}
                onChange={(e) => setFormData({...formData, lieu: e.target.value})}
                placeholder="Ex: Marseille, Calanques"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {loading ? 'Enregistrement...' : 'Suivant : Ajouter des espèces →'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
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
