import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔥 REQUETE RECUE - URL:', request.url);
    
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const adminCheck = await pool.query(
      'SELECT admin FROM role WHERE id_utilisateur = $1',
      [decoded.userId]
    );

    if (adminCheck.rows.length === 0 || !adminCheck.rows[0].admin) {
      return NextResponse.json(
        { error: 'Accès refusé : vous devez être administrateur' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { blocked } = body;

    console.log('🔥 PARAMETRES - userId:', id, 'blocked à mettre:', blocked, 'type:', typeof blocked);

    // Vérifier l'état actuel avant l'update
    const beforeUpdate = await pool.query(
      'SELECT id, pseudo, blocked FROM utilisateur WHERE id = $1',
      [id]
    );
    console.log('🔥 AVANT UPDATE:', beforeUpdate.rows[0]);

    const result = await pool.query(
      'UPDATE utilisateur SET blocked = $1 WHERE id = $2 RETURNING id, pseudo, blocked',
      [blocked, id]
    );

    console.log('🔥 APRES UPDATE:', result.rows[0]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      message: blocked ? 'Utilisateur bloqué' : 'Utilisateur débloqué',
      user: result.rows[0],
    });

  } catch (error) {
    console.error('❌ ERREUR Block user:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
