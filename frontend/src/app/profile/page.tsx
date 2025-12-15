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
      <main className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mon Profil</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Photo de profil */}
          <div className="flex flex-col items-center pb-6 border-b">
            <div className="relative w-32 h-32 mb-4">
              {user.photo_profil ? (
                <Image
                  src={user.photo_profil}
                  alt="Photo de profil"
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-4xl text-blue-600 font-bold">
                    {user.pseudo.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            {!showPhotoInput ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPhotoInput(true)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  {user.photo_profil ? 'Changer la photo' : 'Ajouter une photo'}
                </button>
                {user.photo_profil && (
                  <button
                    onClick={handleRemovePhoto}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            ) : (
              <div className="w-full max-w-md space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
                <button
                  onClick={() => setShowPhotoInput(false)}
                  className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition text-sm"
                >
                  Annuler
                </button>
                <p className="text-xs text-gray-500">
                  Formats acceptés : JPG, PNG, GIF (max 2MB)
                </p>
              </div>
            )}
          </div>

          {/* Informations de base */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Pseudo :</span>
                <span className="ml-2">{user.pseudo}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Nom :</span>
                <span className="ml-2">{user.nom}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Prénom :</span>
                <span className="ml-2">{user.prenom}</span>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              onClick={() => router.push('/profile/edit')}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Modifier mon profil
            </button>
            <button
              onClick={() => router.push('/profile/delete')}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Supprimer mon compte
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
