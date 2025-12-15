import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { pseudo, password } = validation.data;

    const result = await pool.query(
      'SELECT id, pseudo, mot_de_passe, nom, prenom, photo_profil FROM utilisateur WHERE pseudo = $1',
      [pseudo]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Pseudo ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    const isValidPassword = await comparePassword(password, user.mot_de_passe);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Pseudo ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    const token = generateToken(user.id, user.pseudo);

    return NextResponse.json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        pseudo: user.pseudo,
        nom: user.nom,
        prenom: user.prenom,
        photo_profil: user.photo_profil,
      },
      token,
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
