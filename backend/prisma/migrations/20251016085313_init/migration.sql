-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nom" TEXT,
    "prenom" TEXT,
    "pseudo" TEXT,
    "mot_de_passe" TEXT,
    "photo_profil" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "id_utilisateur" TEXT,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plongee" (
    "id" TEXT NOT NULL,
    "titre" TEXT,
    "description" TEXT,
    "pseudo" TEXT,
    "mot_de_passe" TEXT,
    "date" TIMESTAMP(3),
    "type" TEXT,

    CONSTRAINT "Plongee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Espece" (
    "id" TEXT NOT NULL,
    "nom" TEXT,
    "image" TEXT,

    CONSTRAINT "Espece_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelationTable" (
    "id" TEXT NOT NULL,
    "id_plongee" TEXT NOT NULL,
    "id_espece" TEXT NOT NULL,

    CONSTRAINT "RelationTable_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelationTable" ADD CONSTRAINT "RelationTable_id_plongee_fkey" FOREIGN KEY ("id_plongee") REFERENCES "Plongee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelationTable" ADD CONSTRAINT "RelationTable_id_espece_fkey" FOREIGN KEY ("id_espece") REFERENCES "Espece"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
