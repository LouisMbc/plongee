'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    pseudo: '',
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pseudo: formData.pseudo,
          password: formData.password,
          nom: formData.nom,
          prenom: formData.prenom
        })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/';
      } else {
        setError(data.error || 'Erreur lors de l\'inscription');
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6">S&apos;inscrire</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Pseudo *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-md"
              value={formData.pseudo}
              onChange={(e) => setFormData({...formData, pseudo: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nom *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-md"
              value={formData.nom}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Prénom *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-md"
              value={formData.prenom}
              onChange={(e) => setFormData({...formData, prenom: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mot de passe *</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full px-3 py-2 border rounded-md"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirmer le mot de passe *</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border rounded-md"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Déjà inscrit ?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
