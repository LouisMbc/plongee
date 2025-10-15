#!/bin/bash
set -e

# Ce script s'exécute automatiquement lors de la première initialisation de PostgreSQL

echo "Initialisation de la base de données plongee_db..."

# Créer des tables d'exemple (à adapter selon vos besoins)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Table d'exemple pour une application de plongée
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS dive_sites (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        depth_max INTEGER,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS dives (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        dive_site_id INTEGER REFERENCES dive_sites(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        duration INTEGER, -- en minutes
        max_depth INTEGER, -- en mètres
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Insérer des données d'exemple
    INSERT INTO users (email, name) VALUES 
        ('admin@plongee.com', 'Administrateur'),
        ('plongeur@example.com', 'Jean Plongeur')
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO dive_sites (name, location, depth_max, description) VALUES 
        ('Les Moyades', 'Port-Cros, France', 40, 'Site de plongée magnifique avec beaucoup de poissons'),
        ('La Gabinière', 'Port-Cros, France', 45, 'Tombant spectaculaire avec mérous et barracudas')
    ON CONFLICT DO NOTHING;

EOSQL

echo "Initialisation terminée!"