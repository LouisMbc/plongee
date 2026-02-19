import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/especes - Récupérer toutes les espèces
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    let query = 'SELECT id, nom, image FROM espece';
    let countQuery = 'SELECT COUNT(*) FROM espece';
    const params: any[] = [];
    
    // Ajouter le filtre de recherche si présent
    if (search) {
      query += ' WHERE nom ILIKE $1';
      countQuery += ' WHERE nom ILIKE $1';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY nom ASC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    // Récupérer les espèces avec pagination et recherche
    const result = await pool.query(query, params);

    // Compter le total (avec ou sans filtre)
    const countParams = search ? [`%${search}%`] : [];
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      especes: result.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des espèces:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/especes - Créer une nouvelle espèce
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom, image } = body;

    if (!nom) {
      return NextResponse.json(
        { error: 'Le nom est requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'espèce existe déjà
    const existingEspece = await pool.query(
      'SELECT * FROM espece WHERE nom = $1',
      [nom]
    );

    if (existingEspece.rows.length > 0) {
      return NextResponse.json({
        espece: existingEspece.rows[0]
      });
    }

    // Créer la nouvelle espèce
    const result = await pool.query(
      'INSERT INTO espece (nom, image) VALUES ($1, $2) RETURNING *',
      [nom, image || null]
    );

    return NextResponse.json({
      espece: result.rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'espèce:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
