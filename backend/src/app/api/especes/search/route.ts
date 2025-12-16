import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'La recherche doit contenir au moins 2 caractères' },
        { status: 400 }
      );
    }

    // Appel à l'API rfishbase via l'endpoint /search
    const rfishbaseUrl = `http://localhost:8000/search?q=${encodeURIComponent(query)}`;
    
    console.log('🔍 Recherche rfishbase:', rfishbaseUrl);

    const response = await fetch(rfishbaseUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000) // Timeout 10s
    });

    if (!response.ok) {
      console.error('❌ Erreur rfishbase status:', response.status);
      return NextResponse.json(
        { error: 'Erreur lors de la recherche des espèces', status: response.status },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('✅ Résultats rfishbase:', Array.isArray(data) ? `${data.length} résultats` : data);

    // Retourner les résultats même si vide
    return NextResponse.json({
      especes: Array.isArray(data) ? data : [],
      total: Array.isArray(data) ? data.length : 0,
      query: query
    });

  } catch (error) {
    console.error('❌ Search especes error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: String(error) },
      { status: 500 }
    );
  }
}
