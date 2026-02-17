-- AlterTable
ALTER TABLE "ChatConversation" ADD COLUMN     "intentScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "isLead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Matter" ADD COLUMN     "department" TEXT;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "separationMode" TEXT NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "department" TEXT;

-- CreateIndex
CREATE INDEX "ChatConversation_isLead_idx" ON "ChatConversation"("isLead");
