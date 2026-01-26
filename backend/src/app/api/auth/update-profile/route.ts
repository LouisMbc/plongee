import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const updateProfileSchema = z.object({
  pseudo: z.string().min(3, 'Le pseudo doit contenir au moins 3 caractères').optional(),
  nom: z.string().min(2).optional(),
  prenom: z.string().min(2).optional(),
  photo_profil: z.string().nullable().optional(),
});

// Gérer les requêtes OPTIONS (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function PUT(request: NextRequest) {
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
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { pseudo, nom, prenom, photo_profil } = validation.data;

    // Vérifier si le pseudo est déjà utilisé par un autre utilisateur
    if (pseudo !== undefined) {
      const existingUser = await pool.query(
        'SELECT id FROM utilisateur WHERE pseudo = $1 AND id != $2',
        [pseudo, decoded.userId]
      );

      if (existingUser.rows.length > 0) {
        return NextResponse.json(
          { error: 'Ce pseudo est déjà utilisé' },
          { status: 409 }
        );
      }
    }

    // Construire la requête dynamiquement
    const updates: string[] = [];
    const values: (string | null)[] = [];
    let paramIndex = 1;

    if (pseudo !== undefined) {
      updates.push(`pseudo = $${paramIndex}`);
      values.push(pseudo);
      paramIndex++;
    }

    if (nom !== undefined) {
      updates.push(`nom = $${paramIndex}`);
      values.push(nom);
      paramIndex++;
    }

    if (prenom !== undefined) {
      updates.push(`prenom = $${paramIndex}`);
      values.push(prenom);
      paramIndex++;
    }

    if (photo_profil !== undefined) {
      updates.push(`photo_profil = $${paramIndex}`);
      values.push(photo_profil);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'Aucune donnée à mettre à jour' },
        { status: 400 }
      );
    }

    values.push(decoded.userId);

    const query = `
      UPDATE utilisateur 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, pseudo, nom, prenom, photo_profil
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Profil mis à jour avec succès',
      user: result.rows[0],
    });

  } catch {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
