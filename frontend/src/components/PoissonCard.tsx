import Image from 'next/image';
import Link from 'next/link';

interface PoissonCardProps {
  species: string;
  genus: string;
  commonName?: string | null;
  specCode: number;
  imageUrl?: string;
}

export default function PoissonCard({ species, genus, commonName, specCode, imageUrl }: PoissonCardProps) {
  return (
    <Link href={`/poissons/${specCode}`}>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-blue-100 to-cyan-100">
          {imageUrl && imageUrl !== 'NA' ? (
            <Image
              src={imageUrl}
              alt={`Photo de ${species}`}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-7xl opacity-50">🐠</span>
            </div>
          )}
          {/* Badge SpecCode */}
          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            #{specCode}
          </div>
        </div>

        {/* Infos */}
        <div className="p-4 bg-gradient-to-b from-white to-gray-50">
          <h3 className="font-bold text-lg mb-1 text-blue-800 italic truncate" title={species}>
            {species}
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Genre:</span>
              <span className="font-semibold text-gray-700">{genus}</span>
            </div>
            
            {commonName && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Nom commun:</span>
                <span className="text-gray-700 truncate" title={commonName}>
                  {commonName}
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              FishBase
            </span>
            <span className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
              Détails →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
