'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface User {
  id: string;
  pseudo: string;
  nom: string;
  prenom: string;
  photo_profil?: string | null;
  blocked: boolean;
  admin: boolean;
  created_at: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userData);
    if (!user.admin) {
      router.push('/');
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();

      if (res.ok) {
        setUsers(data.users);
      } else {
        setError(data.error || 'Erreur lors du chargement');
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (userId: string, currentBlocked: boolean) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:3001/api/admin/users/${userId}/block`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ blocked: !currentBlocked })
      });

      if (res.ok) {
        await loadUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur');
      }
    } catch {
      alert('Erreur de connexion au serveur');
    }
  };

  const handleToggleAdmin = async (userId: string, currentAdmin: boolean) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:3001/api/admin/users/${userId}/promote`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ admin: !currentAdmin })
      });

      if (res.ok) {
        await loadUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur');
      }
    } catch {
      alert('Erreur de connexion au serveur');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });

      if (res.ok) {
        await loadUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur');
      }
    } catch {
      alert('Erreur de connexion au serveur');
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
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Administration</h1>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
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

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
          <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                Gestion des Utilisateurs
              </h2>
              <span className="px-5 py-2 bg-white/20 rounded-full text-sm font-semibold">
                {users.length} utilisateur{users.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Inscription
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10">
                          {user.photo_profil ? (
                            <Image
                              src={user.photo_profil}
                              alt={user.pseudo}
                              fill
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-lg text-blue-600 font-bold">
                                {user.pseudo.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold">{user.pseudo}</div>
                          <div className="text-sm text-gray-500">
                            {user.nom} {user.prenom}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {user.admin && (
                          <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                            Admin
                          </span>
                        )}
                        {user.blocked && (
                          <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                            Bloqué
                          </span>
                        )}
                        {!user.admin && !user.blocked && (
                          <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                            Actif
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleBlock(user.id, user.blocked);
                          }}
                          className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all duration-300 ${
                            user.blocked
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-md'
                              : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-md'
                          }`}
                          type="button"
                        >
                          {user.blocked ? 'Débloquer' : 'Bloquer'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleAdmin(user.id, user.admin);
                          }}
                          className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all duration-300 ${
                            user.admin
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-md'
                          }`}
                          type="button"
                        >
                          {user.admin ? 'Retirer admin' : 'Promouvoir'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(user.id);
                          }}
                          className="px-4 py-2 text-xs bg-red-600 text-white hover:bg-red-700 rounded-lg font-semibold transition-all duration-300 shadow-md"
                          type="button"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
