'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  pseudo: string;
  nom: string;
  prenom: string;
  photo_profil?: string | null;
  admin?: boolean; // Ajouter le champ admin
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Charger l'utilisateur depuis localStorage
    const userData = localStorage.getItem('user');
    console.log('Header: userData =', userData); // Debug
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData) as User;
        console.log('Header: parsedUser =', parsedUser); // Debug
        setUser(parsedUser);
      } catch (e) {
        console.error('Header: erreur parsing user', e);
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  console.log('Header render: user =', user); // Debug

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Plongée
        </Link>
        
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <span className="text-sm">Bonjour, {user.pseudo}</span>
              
              <Link 
                href="/plongees/new" 
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition font-semibold"
              >
                ➕ Nouvelle plongée
              </Link>
              
              {user.admin && (
                <Link 
                  href="/admin" 
                  className="px-4 py-2 bg-yellow-500 text-blue-900 rounded hover:bg-yellow-400 transition font-semibold"
                >
                  ⚙️ Admin
                </Link>
              )}
              
              <Link 
                href="/profile" 
                className="px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Mon profil
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 transition"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Se connecter
              </Link>
              <Link 
                href="/register" 
                className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-100 transition"
              >
                S&apos;inscrire
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
