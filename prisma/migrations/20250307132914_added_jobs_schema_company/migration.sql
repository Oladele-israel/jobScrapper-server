/*
  Warnings:

  - You are about to drop the column `comapny` on the `Jobs` table. All the data in the column will be lost.
  - Added the required column `company` to the `Jobs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Jobs" DROP COLUMN "comapny",
ADD COLUMN     "company" TEXT NOT NULL;
