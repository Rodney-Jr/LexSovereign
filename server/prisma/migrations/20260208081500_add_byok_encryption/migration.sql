-- Manually add missing columns for BYOK and updatedAt synchronization
-- This script is designed for Railway's 'prisma migrate deploy'
-- Using case-insensitive checks for maximum robustness across different Postgres environments

-- Fix Tenant table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE LOWER(table_name)=LOWER('Tenant') AND LOWER(column_name)=LOWER('encryptionMode')) THEN
        ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "encryptionMode" TEXT NOT NULL DEFAULT 'SYSTEM_MANAGED';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE LOWER(table_name)=LOWER('Tenant') AND LOWER(column_name)=LOWER('updatedAt')) THEN
        ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Fix Document table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE LOWER(table_name)=LOWER('Document') AND LOWER(column_name)=LOWER('encryptionKeyId')) THEN
        ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "encryptionKeyId" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE LOWER(table_name)=LOWER('Document') AND LOWER(column_name)=LOWER('isEncrypted')) THEN
        ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "isEncrypted" BOOLEAN NOT NULL DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE LOWER(table_name)=LOWER('Document') AND LOWER(column_name)=LOWER('encryptionIV')) THEN
        ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "encryptionIV" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE LOWER(table_name)=LOWER('Document') AND LOWER(column_name)=LOWER('updatedAt')) THEN
        ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Fix Matter table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE LOWER(table_name)=LOWER('Matter') AND LOWER(column_name)=LOWER('updatedAt')) THEN
        ALTER TABLE "Matter" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Fix User table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE LOWER(table_name)=LOWER('User') AND LOWER(column_name)=LOWER('updatedAt')) THEN
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Fix other tables with updatedAt
DO $$ 
BEGIN 
    -- Policy
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE LOWER(table_name)=LOWER('Policy') AND LOWER(column_name)=LOWER('updatedAt')) THEN
        ALTER TABLE "Policy" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
    -- KnowledgeArtifact
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE LOWER(table_name)=LOWER('KnowledgeArtifact') AND LOWER(column_name)=LOWER('updatedAt')) THEN
        ALTER TABLE "KnowledgeArtifact" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
    -- DocumentTemplate
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE LOWER(table_name)=LOWER('DocumentTemplate') AND LOWER(column_name)=LOWER('updatedAt')) THEN
        ALTER TABLE "DocumentTemplate" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
    -- RegulatoryRule
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE LOWER(table_name)=LOWER('RegulatoryRule') AND LOWER(column_name)=LOWER('updatedAt')) THEN
        ALTER TABLE "RegulatoryRule" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
    -- PricingConfig
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE LOWER(table_name)=LOWER('PricingConfig') AND LOWER(column_name)=LOWER('updatedAt')) THEN
        ALTER TABLE "PricingConfig" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
    -- BrandingProfile
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE LOWER(table_name)=LOWER('BrandingProfile') AND LOWER(column_name)=LOWER('updatedAt')) THEN
        ALTER TABLE "BrandingProfile" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;
