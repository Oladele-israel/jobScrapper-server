/*
  Warnings:

  - You are about to drop the column `hashRT` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "hashRT",
ADD COLUMN     "hashRt" TEXT;
