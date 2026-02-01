'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

interface PoissonDetails {
  Species: string | string[];
  Genus: string | string[];
  FBname?: string | string[] | null;
  SpecCode: number | number[];
  Author?: string | string[];
  BodyShapeI?: string | string[];
  Fresh?: number | number[];
  Brack?: number | number[];
  Saltwater?: number | number[];
  DemersPelag?: string | string[];
  DepthRangeShallow?: number | number[];
  DepthRangeDeep?: number | number[];
  Length?: number | number[];
  Comments?: string | string[];
  ImageURL?: string | string[];
}

export default function PoissonDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [poisson, setPoisson] = useState<PoissonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPoissonDetails();
  }, [params.specCode]);

  const loadPoissonDetails = async () => {
    // TODO: Remplacer par l'accès à la base de données locale
    try {
      // Simulation - À remplacer par la logique de base de données locale
      setPoisson(null);
      setError('Fonctionnalité non implémentée - base de données locale à configurer');
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🐟</div>
          <p className="text-xl text-gray-600">Chargement des détails...</p>
        </div>
      </main>
    );
  }

  if (error || !poisson) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/poissons')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ← Retour à la liste
          </button>
        </div>
      </main>
    );
  }

  const habitat = [];
  if (poisson.Fresh === 1) habitat.push('Eau douce');
  if (poisson.Brack === 1) habitat.push('Eau saumâtre');
  if (poisson.Saltwater === 1) habitat.push('Eau salée');

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Bouton retour */}
        <button
          onClick={() => router.push('/poissons')}
          className="mb-6 px-4 py-2 bg-white rounded-lg shadow hover:shadow-lg transition flex items-center gap-2"
        >
          ← Retour à la liste
        </button>

        {/* Carte principale */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Image */}
          <div className="relative h-96 bg-gradient-to-br from-blue-200 to-cyan-200">
            {poisson.ImageURL && 
             typeof poisson.ImageURL === 'string' && 
             poisson.ImageURL !== 'NA' && 
             poisson.ImageURL.trim() !== '' ? (
              <Image
                src={poisson.ImageURL}
                alt={`Photo de ${poisson.Species}`}
                fill
                className="object-contain p-4"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-9xl opacity-50">🐠</span>
              </div>
            )}
            <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full font-bold">
              #{poisson.SpecCode}
            </div>
          </div>

          {/* Informations */}
          <div className="p-8">
            <h1 className="text-4xl font-bold text-blue-900 italic mb-2">
              {poisson.Species}
            </h1>
            {poisson.Author && (
              <p className="text-gray-600 mb-4">{poisson.Author}</p>
            )}
            {poisson.FBname && (
              <p className="text-xl text-gray-700 mb-6">
                Nom commun: <span className="font-semibold">{poisson.FBname}</span>
              </p>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Colonne 1 */}
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-900 mb-2">🏷️ Classification</h3>
                  <p className="text-sm">Genre: <span className="font-semibold">{poisson.Genus}</span></p>
                </div>

                {habitat.length > 0 && (
                  <div className="bg-cyan-50 p-4 rounded-lg">
                    <h3 className="font-bold text-cyan-900 mb-2">🌊 Habitat</h3>
                    <p className="text-sm">{habitat.join(', ')}</p>
                  </div>
                )}

                {poisson.DemersPelag && (
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <h3 className="font-bold text-teal-900 mb-2">📍 Environnement</h3>
                    <p className="text-sm">{poisson.DemersPelag}</p>
                  </div>
                )}
              </div>

              {/* Colonne 2 */}
              <div className="space-y-4">
                {(poisson.DepthRangeShallow || poisson.DepthRangeDeep) && (
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="font-bold text-indigo-900 mb-2">📏 Profondeur</h3>
                    <p className="text-sm">
                      {poisson.DepthRangeShallow && `${poisson.DepthRangeShallow}m`}
                      {poisson.DepthRangeShallow && poisson.DepthRangeDeep && ' - '}
                      {poisson.DepthRangeDeep && `${poisson.DepthRangeDeep}m`}
                    </p>
                  </div>
                )}

                {poisson.Length && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-bold text-purple-900 mb-2">📐 Taille max</h3>
                    <p className="text-sm">{poisson.Length} cm</p>
                  </div>
                )}

                {poisson.BodyShapeI && (
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <h3 className="font-bold text-pink-900 mb-2">🐟 Forme</h3>
                    <p className="text-sm">{poisson.BodyShapeI}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Commentaires */}
            {poisson.Comments && typeof poisson.Comments === 'string' && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-3">ℹ️ Informations complémentaires</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {poisson.Comments.length > 500 
                    ? poisson.Comments.substring(0, 500) + '...'
                    : poisson.Comments
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
