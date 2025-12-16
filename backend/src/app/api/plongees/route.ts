import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const createPlongeeSchema = z.object({
  titre: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().optional(),
  date: z.string(), // Format ISO date
  type: z.string().optional(),
  profondeur: z.number().positive('La profondeur doit être positive').optional(),
  temps: z.number().positive('Le temps doit être positif').optional(),
  lieu: z.string().optional(),
});

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Créer une plongée
export async function POST(request: NextRequest) {
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

    // Vérifier que l'utilisateur n'est pas bloqué
    const userCheck = await pool.query(
      'SELECT blocked FROM utilisateur WHERE id = $1',
      [decoded.userId]
    );

    if (userCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    if (userCheck.rows[0].blocked) {
      return NextResponse.json({ error: 'Votre compte est bloqué' }, { status: 403 });
    }

    const body = await request.json();
    const validation = createPlongeeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { titre, description, date, type, profondeur, temps, lieu } = validation.data;

    const result = await pool.query(
      `INSERT INTO plongee (titre, description, date, type, profondeur, temps, lieu, id_utilisateur)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [titre, description, date, type, profondeur, temps, lieu, decoded.userId]
    );

    return NextResponse.json({
      message: 'Plongée créée avec succès',
      plongee: result.rows[0],
    }, { status: 201 });

  } catch (error) {
    console.error('Create plongee error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Récupérer toutes les plongées de l'utilisateur
export async function GET(request: NextRequest) {
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

    const result = await pool.query(
      `SELECT * FROM plongee 
       WHERE id_utilisateur = $1 
       ORDER BY date DESC`,
      [decoded.userId]
    );

    return NextResponse.json({
      plongees: result.rows,
      total: result.rows.length,
    });

  } catch (error) {
    console.error('Get plongees error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
