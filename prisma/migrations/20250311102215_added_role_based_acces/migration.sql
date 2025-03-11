-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('VOTER', 'ADMIN');

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "role" "Roles" NOT NULL DEFAULT 'VOTER';
