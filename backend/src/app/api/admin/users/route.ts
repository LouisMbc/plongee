import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

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
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est admin
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

    // Récupérer tous les utilisateurs avec leur rôle
    const result = await pool.query(`
      SELECT 
        u.id, 
        u.pseudo, 
        u.nom, 
        u.prenom, 
        u.photo_profil, 
        u.blocked, 
        u.created_at,
        COALESCE(r.admin, false) as admin
      FROM utilisateur u
      LEFT JOIN role r ON u.id = r.id_utilisateur
      ORDER BY u.created_at DESC
    `);

    return NextResponse.json({
      users: result.rows,
      total: result.rows.length,
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
