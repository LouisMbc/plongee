-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table Utilisateur
CREATE TABLE IF NOT EXISTS utilisateur (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(80) NOT NULL,
    prenom VARCHAR(80) NOT NULL,
    pseudo VARCHAR(80) UNIQUE NOT NULL,
    mot_de_passe TEXT NOT NULL,
    photo_profil TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Role
CREATE TABLE IF NOT EXISTS role (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin BOOLEAN DEFAULT FALSE,
    id_utilisateur UUID REFERENCES utilisateur(id) ON DELETE CASCADE
);

-- Table Plongée
CREATE TABLE IF NOT EXISTS plongee (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titre VARCHAR(80) NOT NULL,
    description VARCHAR(80),
    date TIMESTAMP NOT NULL,
    type TEXT,
    profondeur INT,
    temps INT,
    lieu TEXT,
    id_utilisateur UUID REFERENCES utilisateur(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Espece
CREATE TABLE IF NOT EXISTS espece (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(80) NOT NULL,
    image TEXT
);

-- Table relationnelle plongee_espece
CREATE TABLE IF NOT EXISTS plongee_espece (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_plongee UUID REFERENCES plongee(id) ON DELETE CASCADE,
    id_espece UUID REFERENCES espece(id) ON DELETE CASCADE,
    UNIQUE(id_plongee, id_espece)
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_utilisateur_pseudo ON utilisateur(pseudo);
CREATE INDEX IF NOT EXISTS idx_plongee_utilisateur ON plongee(id_utilisateur);
CREATE INDEX IF NOT EXISTS idx_role_utilisateur ON role(id_utilisateur);

-- Log de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Tables créées avec succès !';
END $$;
