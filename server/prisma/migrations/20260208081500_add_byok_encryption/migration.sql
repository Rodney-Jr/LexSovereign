-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN "encryptionMode" TEXT NOT NULL DEFAULT 'SYSTEM_MANAGED';

-- AlterTable
ALTER TABLE "Document" ADD COLUMN "encryptionKeyId" TEXT,
ADD COLUMN "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "encryptionIV" TEXT;
