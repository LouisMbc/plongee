import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';
import { registerSchema } from '@/lib/validation';

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Gestion des requêtes OPTIONS (preflight CORS)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.errors },
        { status: 400, headers: corsHeaders }
      );
    }

    const { pseudo, password, nom, prenom, photo_profil } = validation.data;

    const existingUser = await pool.query(
      'SELECT id FROM utilisateur WHERE pseudo = $1',
      [pseudo]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Ce pseudo est déjà utilisé' },
        { status: 409, headers: corsHeaders }
      );
    }

    const hashedPassword = await hashPassword(password);

    const result = await pool.query(
      'INSERT INTO utilisateur (pseudo, mot_de_passe, nom, prenom, photo_profil) VALUES ($1, $2, $3, $4, $5) RETURNING id, pseudo, nom, prenom, photo_profil',
      [pseudo, hashedPassword, nom, prenom, photo_profil || null]
    );

    const user = result.rows[0];

    await pool.query(
      'INSERT INTO role (id_utilisateur, admin) VALUES ($1, $2)',
      [user.id, false]
    );

    const token = generateToken(user.id, user.pseudo);

    return NextResponse.json({
      message: 'Inscription réussie',
      user: {
        id: user.id,
        pseudo: user.pseudo,
        nom: user.nom,
        prenom: user.prenom,
        photo_profil: user.photo_profil,
      },
      token,
    }, { status: 201, headers: corsHeaders });

  } catch {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500, headers: corsHeaders }
    );
  }
}
