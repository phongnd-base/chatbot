-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('OPENAI', 'GOOGLE', 'ANTHROPIC');

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "provider" "Provider" NOT NULL DEFAULT 'OPENAI';
