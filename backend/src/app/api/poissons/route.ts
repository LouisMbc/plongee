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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Appel à l'API rfishbase pour récupérer une liste
    const rfishbaseUrl = `http://localhost:8000/species/list?page=${page}&limit=${limit}`;
    
    console.log('🐟 Récupération poissons:', rfishbaseUrl);

    const response = await fetch(rfishbaseUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(60000) // Timeout 60s au lieu de 10s
    });

    if (!response.ok) {
      console.error('❌ Erreur rfishbase status:', response.status);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des poissons' },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('✅ Poissons récupérés:', Array.isArray(data.species) ? data.species.length : 0);

    return NextResponse.json({
      poissons: data, // Retourner toute la structure de rfishbase
      page: page,
      limit: limit,
    });

  } catch (error) {
    console.error('❌ Get poissons error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: String(error) },
      { status: 500 }
    );
  }
}
