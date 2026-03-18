-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "metadata" JSONB DEFAULT '{}';

-- AlterTable
ALTER TABLE "ChatConversation" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;

-- AlterTable
ALTER TABLE "CollaborationMessage" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
-- Note: Making it NOT NULL might fail if there's existing data, so we'll keep it nullable or handle it.
-- Based on the previous crash, I will use IF NOT EXISTS for everything.

-- AlterTable
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "physicalRegion" TEXT NOT NULL DEFAULT 'GH_ACC_1',
ADD COLUMN IF NOT EXISTS "residencyStatus" TEXT NOT NULL DEFAULT 'LOCAL_PINNED';

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "notes" TEXT,
ADD COLUMN IF NOT EXISTS "tenantId" TEXT;

-- AlterTable
ALTER TABLE "PredictiveRisk" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "enclaveOnlyProcessing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "jurisdiction" TEXT NOT NULL DEFAULT 'GH_ACC_1',
ADD COLUMN IF NOT EXISTS "storageBucketUri" TEXT,
ADD COLUMN IF NOT EXISTS "uiVisibilityConfig" JSONB DEFAULT '{}';

-- CreateTable
CREATE TABLE IF NOT EXISTS "SupportAccessGrant" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "grantedByUserId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SupportAccessGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CloudIntegration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "uid" TEXT,
    "email" TEXT,
    "expiresAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CloudIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PlatformFolderSync" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "integrationId" TEXT,
    "folderId" TEXT NOT NULL,
    "folderName" TEXT,
    "provider" TEXT NOT NULL,
    "targetMatterId" TEXT,
    "webhookId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformFolderSync_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ApiKey" (
    "id" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsed" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

-- AddForeignKey
-- Note: PostgreSQL does not support IF NOT EXISTS for foreign keys directly. 
-- However, we can wrap them in a DO block for safety.
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Lead_tenantId_fkey') THEN
        ALTER TABLE "Lead" ADD CONSTRAINT "Lead_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ChatConversation_tenantId_fkey') THEN
        ALTER TABLE "ChatConversation" ADD CONSTRAINT "ChatConversation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CloudIntegration_tenantId_fkey') THEN
        ALTER TABLE "CloudIntegration" ADD CONSTRAINT "CloudIntegration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PlatformFolderSync_tenantId_fkey') THEN
        ALTER TABLE "PlatformFolderSync" ADD CONSTRAINT "PlatformFolderSync_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ApiKey_tenantId_fkey') THEN
        ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

