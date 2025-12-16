import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
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

    const { id } = await params;

    // Empêcher l'admin de se supprimer lui-même
    if (id === decoded.userId) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 400 }
      );
    }

    // Supprimer l'utilisateur (cascade activé)
    await pool.query('DELETE FROM utilisateur WHERE id = $1', [id]);

    return NextResponse.json({
      message: 'Utilisateur supprimé avec succès',
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
