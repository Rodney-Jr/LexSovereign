-- Manually add missing columns for BYOK and updatedAt synchronization
-- This script is designed for Railway's 'prisma migrate deploy'

-- Fix Tenant table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Tenant' AND column_name='encryptionMode') THEN
        ALTER TABLE "Tenant" ADD COLUMN "encryptionMode" TEXT NOT NULL DEFAULT 'SYSTEM_MANAGED';
    END IF;
END $$;

-- Fix Document table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Document' AND column_name='encryptionKeyId') THEN
        ALTER TABLE "Document" ADD COLUMN "encryptionKeyId" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Document' AND column_name='isEncrypted') THEN
        ALTER TABLE "Document" ADD COLUMN "isEncrypted" BOOLEAN NOT NULL DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Document' AND column_name='encryptionIV') THEN
        ALTER TABLE "Document" ADD COLUMN "encryptionIV" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Document' AND column_name='updatedAt') THEN
        ALTER TABLE "Document" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;
