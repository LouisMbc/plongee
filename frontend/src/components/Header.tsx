'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  pseudo: string;
  nom: string;
  prenom: string;
  photo_profil?: string | null;
  admin?: boolean;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData) as User;
        setUser(parsedUser);
      } catch {
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

  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-cyan-900 text-white shadow-lg border-b-4 border-cyan-500">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo et titre */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center group-hover:bg-cyan-400 transition-all duration-300">
              <svg className="w-6 h-6 text-blue-900" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wide group-hover:text-cyan-300 transition-colors">
                DIVE LOG
              </h1>
              <p className="text-xs text-cyan-300 tracking-widest">Carnet de Plongée</p>
            </div>
          </Link>
          
          {/* Navigation */}
          <div className="flex gap-2 items-center">
            {user ? (
              <>
                <Link 
                  href="/poissons" 
                  className="px-4 py-2 bg-blue-800/30 rounded-md hover:bg-blue-800/50 transition-all duration-200 text-sm font-medium border border-cyan-500/30 hover:border-cyan-500"
                >
                  Espèces Marines
                </Link>
                
                <Link 
                  href="/plongees/new" 
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-md hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 font-semibold shadow-md text-sm"
                >
                  Nouvelle Plongée
                </Link>
                
                {user.admin && (
                  <Link 
                    href="/admin" 
                    className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-md hover:from-yellow-400 hover:to-orange-400 transition-all duration-200 font-semibold shadow-md text-sm"
                  >
                    Administration
                  </Link>
                )}
                
                <Link 
                  href="/profile" 
                  className="px-4 py-2 bg-blue-800/30 rounded-md hover:bg-blue-800/50 transition-all duration-200 text-sm font-medium border border-cyan-500/30 hover:border-cyan-500"
                >
                  Profil
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600/80 rounded-md hover:bg-red-600 transition-all duration-200 text-sm font-medium ml-2"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="px-5 py-2 rounded-md hover:bg-blue-800/50 transition-all duration-200 font-medium border border-cyan-500/50 hover:border-cyan-500"
                >
                  Connexion
                </Link>
                <Link 
                  href="/register" 
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-md hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 font-semibold shadow-md"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
