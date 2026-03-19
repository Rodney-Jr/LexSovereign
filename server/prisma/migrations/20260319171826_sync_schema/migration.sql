/*
  Warnings:

  - You are about to drop the column `client` on the `Matter` table. All the data in the column will be lost.
  - Made the column `tenantId` on table `CollaborationMessage` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tenantId` on table `PredictiveRisk` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CollaborationMessage" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Matter" DROP COLUMN "client",
ADD COLUMN     "clientId" TEXT;

-- AlterTable
ALTER TABLE "PredictiveRisk" ALTER COLUMN "tenantId" SET NOT NULL;

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "billingAddress" TEXT,
    "taxId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'CORPORATE',
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "attributes" JSONB DEFAULT '{}',

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatterTeamMember" (
    "id" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'COLLABORATOR',
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatterTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MatterTeamMember_matterId_userId_key" ON "MatterTeamMember"("matterId", "userId");

-- AddForeignKey
ALTER TABLE "Matter" ADD CONSTRAINT "Matter_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatterTeamMember" ADD CONSTRAINT "MatterTeamMember_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatterTeamMember" ADD CONSTRAINT "MatterTeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
