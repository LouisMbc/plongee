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
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPhotoInput, setShowPhotoInput] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch {
      router.push('/login');
    }
    
    setLoading(false);
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Vérifier que c'est une image
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('L\'image est trop grande (max 2MB)');
      return;
    }

    // Convertir en Base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      
      // Appeler l'API pour sauvegarder
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch('http://localhost:3001/api/auth/update-profile', {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ photo_profil: base64String })
        });

        const data = await res.json();

        if (res.ok) {
          // Mettre à jour le localStorage et l'état
          const updatedUser = { ...user, photo_profil: base64String };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setShowPhotoInput(false);
        } else {
          alert(data.error || 'Erreur lors de la mise à jour');
        }
      } catch {
        alert('Erreur de connexion au serveur');
      }
    };
    
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    if (!user) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:3001/api/auth/update-profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ photo_profil: null })
      });

      const data = await res.json();

      if (res.ok) {
        const updatedUser = { ...user, photo_profil: null };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        alert(data.error || 'Erreur lors de la suppression');
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

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Mon Profil</h1>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Photo de profil */}
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                {user.photo_profil ? (
                  <Image
                    src={user.photo_profil}
                    alt="Photo de profil"
                    fill
                    className="rounded-full object-cover border-4 border-blue-200 shadow-lg"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center border-4 border-blue-200 shadow-lg">
                    <span className="text-4xl text-blue-700 font-bold">
                      {user.pseudo.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {!showPhotoInput ? (
                <div className="flex flex-col gap-2 w-full">
                  <button
                    onClick={() => setShowPhotoInput(true)}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-300 font-medium text-sm"
                  >
                    {user.photo_profil ? 'Changer' : 'Ajouter'}
                  </button>
                  {user.photo_profil && (
                    <button
                      onClick={handleRemovePhoto}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-300 font-medium text-sm"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-full space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-xs"
                  />
                  <button
                    onClick={() => setShowPhotoInput(false)}
                    className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                  >
                    Annuler
                  </button>
                  <p className="text-xs text-gray-600">Max 2MB</p>
                </div>
              )}
            </div>

            {/* Informations personnelles */}
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-xl font-bold mb-4 text-blue-900">Informations Personnelles</h2>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                  <span className="text-xs font-semibold text-gray-600 block mb-1">Pseudo</span>
                  <span className="text-lg font-bold text-blue-900">{user.pseudo}</span>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                  <span className="text-xs font-semibold text-gray-600 block mb-1">Nom</span>
                  <span className="text-lg font-bold text-blue-900">{user.nom}</span>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                  <span className="text-xs font-semibold text-gray-600 block mb-1">Prénom</span>
                  <span className="text-lg font-bold text-blue-900">{user.prenom}</span>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => router.push('/profile/edit')}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Modifier
                </button>
                <button
                  onClick={() => router.push('/profile/delete')}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
