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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ specCode: string }> }
) {
  try {
    const { specCode } = await params;

    if (!specCode) {
      return NextResponse.json({ error: 'SpecCode manquant' }, { status: 400 });
    }

    // Appel à l'API rfishbase pour les détails
    const rfishbaseUrl = `http://localhost:8000/species/details?specCode=${specCode}`;
    
    console.log('🐟 Détails poisson:', rfishbaseUrl);

    const response = await fetch(rfishbaseUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      console.error('❌ Erreur rfishbase status:', response.status);
      return NextResponse.json(
        { error: 'Poisson non trouvé' },
        { status: 404 }
      );
    }

    const data = await response.json();
    console.log('✅ Détails récupérés');

    return NextResponse.json({ poisson: data });

  } catch (error) {
    console.error('❌ Get poisson details error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
