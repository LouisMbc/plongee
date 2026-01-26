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

    // Trouver l'utilisateur avec son rôle
    const result = await pool.query(
      `SELECT u.id, u.pseudo, u.mot_de_passe, u.nom, u.prenom, u.photo_profil, u.blocked, r.admin
       FROM utilisateur u
       LEFT JOIN role r ON u.id = r.id_utilisateur
       WHERE u.pseudo = $1`,
      [pseudo]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Pseudo ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Vérifier si l'utilisateur est bloqué
    if (user.blocked) {
      return NextResponse.json(
        { error: 'Votre compte a été bloqué par un administrateur' },
        { status: 403 }
      );
    }

    // Vérifier le mot de passe
    const isValidPassword = await comparePassword(password, user.mot_de_passe);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Pseudo ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Générer le token
    const token = generateToken(user.id, user.pseudo);

    return NextResponse.json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        pseudo: user.pseudo,
        nom: user.nom,
        prenom: user.prenom,
        photo_profil: user.photo_profil,
        admin: user.admin || false, // Ajouter le statut admin
      },
      token,
    });

  } catch {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
