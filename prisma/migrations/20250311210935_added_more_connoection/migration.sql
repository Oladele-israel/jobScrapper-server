/*
  Warnings:

  - You are about to drop the column `candidates` on the `space` table. All the data in the column will be lost.
  - Added the required column `spaceId` to the `ElectionCandidate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ElectionCandidate" ADD COLUMN     "spaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "space" DROP COLUMN "candidates",
ALTER COLUMN "votingLink" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ElectionCandidate" ADD CONSTRAINT "ElectionCandidate_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "space"("id") ON DELETE CASCADE ON UPDATE CASCADE;
