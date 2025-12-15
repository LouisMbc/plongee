/*
  Warnings:

  - The primary key for the `Espece` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Plongee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `RelationTable` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id_utilisateur` column on the `Role` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `Espece` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Plongee` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `RelationTable` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id_plongee` on the `RelationTable` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id_espece` on the `RelationTable` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Role` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "RelationTable" DROP CONSTRAINT "RelationTable_id_espece_fkey";

-- DropForeignKey
ALTER TABLE "RelationTable" DROP CONSTRAINT "RelationTable_id_plongee_fkey";

-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_id_utilisateur_fkey";

-- AlterTable
ALTER TABLE "Espece" DROP CONSTRAINT "Espece_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Espece_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Plongee" DROP CONSTRAINT "Plongee_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Plongee_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "RelationTable" DROP CONSTRAINT "RelationTable_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "id_plongee",
ADD COLUMN     "id_plongee" UUID NOT NULL,
DROP COLUMN "id_espece",
ADD COLUMN     "id_espece" UUID NOT NULL,
ADD CONSTRAINT "RelationTable_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Role" DROP CONSTRAINT "Role_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "id_utilisateur",
ADD COLUMN     "id_utilisateur" UUID,
ADD CONSTRAINT "Role_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelationTable" ADD CONSTRAINT "RelationTable_id_plongee_fkey" FOREIGN KEY ("id_plongee") REFERENCES "Plongee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelationTable" ADD CONSTRAINT "RelationTable_id_espece_fkey" FOREIGN KEY ("id_espece") REFERENCES "Espece"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
