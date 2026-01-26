import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken, comparePassword } from '@/lib/auth';
import { z } from 'zod';

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Le mot de passe est requis'),
});

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

export async function DELETE(request: NextRequest) {
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

    const body = await request.json();
    const validation = deleteAccountSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { password } = validation.data;

    // Récupérer l'utilisateur avec son mot de passe
    const result = await pool.query(
      'SELECT id, mot_de_passe FROM utilisateur WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    // Vérifier le mot de passe
    const isValidPassword = await comparePassword(password, user.mot_de_passe);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Supprimer l'utilisateur (cascade configuré en SQL)
    await pool.query(
      'DELETE FROM utilisateur WHERE id = $1',
      [decoded.userId]
    );

    return NextResponse.json({
      message: 'Compte supprimé avec succès',
    });

  } catch {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
