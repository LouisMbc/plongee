import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const addEspeceSchema = z.object({
  specCode: z.number(),
  nom: z.string(),
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

// Récupérer les espèces d'une plongée
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      `SELECT e.* FROM espece e
       INNER JOIN plongee_espece pe ON e.id = pe.id_espece
       WHERE pe.id_plongee = $1`,
      [id]
    );

    return NextResponse.json({
      especes: result.rows,
    });

  } catch (error) {
    console.error('Get especes error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Ajouter une espèce à une plongée
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const body = await request.json();
    const validation = addEspeceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { specCode, nom } = validation.data;

    // Vérifier que la plongée appartient à l'utilisateur
    const plongeeCheck = await pool.query(
      'SELECT id FROM plongee WHERE id = $1 AND id_utilisateur = $2',
      [id, decoded.userId]
    );

    if (plongeeCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Plongée non trouvée' }, { status: 404 });
    }

    // Vérifier si l'espèce existe déjà dans la table espece
    let especeResult = await pool.query(
      'SELECT id FROM espece WHERE nom = $1',
      [nom]
    );

    let especeId;
    if (especeResult.rows.length === 0) {
      // Créer l'espèce si elle n'existe pas
      const newEspece = await pool.query(
        'INSERT INTO espece (nom) VALUES ($1) RETURNING id',
        [nom]
      );
      especeId = newEspece.rows[0].id;
    } else {
      especeId = especeResult.rows[0].id;
    }

    // Vérifier si l'espèce n'est pas déjà associée à cette plongée
    const existingLink = await pool.query(
      'SELECT id FROM plongee_espece WHERE id_plongee = $1 AND id_espece = $2',
      [id, especeId]
    );

    if (existingLink.rows.length > 0) {
      return NextResponse.json(
        { error: 'Cette espèce est déjà ajoutée à cette plongée' },
        { status: 409 }
      );
    }

    // Associer l'espèce à la plongée
    await pool.query(
      'INSERT INTO plongee_espece (id_plongee, id_espece) VALUES ($1, $2)',
      [id, especeId]
    );

    return NextResponse.json({
      message: 'Espèce ajoutée avec succès',
      especeId: especeId,
    }, { status: 201 });

  } catch (error) {
    console.error('Add espece error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
