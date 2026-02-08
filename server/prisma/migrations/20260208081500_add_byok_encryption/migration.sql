-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "encryptionMode" TEXT NOT NULL DEFAULT 'SYSTEM_MANAGED';

-- AlterTable
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "encryptionKeyId" TEXT,
ADD COLUMN IF NOT EXISTS "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "encryptionIV" TEXT,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create an internal function to update updatedAt if needed, but for manual migrations ADD COLUMN is usually enough if Prisma handles the rest.
