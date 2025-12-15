import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Plongée
        </Link>
        
        <div className="flex gap-4">
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
        </div>
      </nav>
    </header>
  );
}
