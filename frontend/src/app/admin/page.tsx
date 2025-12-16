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

    // Pas de confirmation pour simplifier (popup bloquée)
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
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur de connexion au serveur');
    }
  };

  const handleToggleAdmin = async (userId: string, currentAdmin: boolean) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Pas de confirmation (popup bloquée)
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

    // Pas de confirmation (popup bloquée)
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
      <main className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">⚙️ Administration</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-600 text-white">
            <h2 className="text-xl font-semibold">
              Gestion des utilisateurs ({users.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Inscription
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">
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
                            👑 Admin
                          </span>
                        )}
                        {user.blocked && (
                          <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                            🚫 Bloqué
                          </span>
                        )}
                        {!user.admin && !user.blocked && (
                          <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                            ✅ Actif
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
                          className={`px-3 py-1 text-xs rounded cursor-pointer ${
                            user.blocked
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
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
                          className={`px-3 py-1 text-xs rounded cursor-pointer ${
                            user.admin
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
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
                          className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded cursor-pointer"
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
