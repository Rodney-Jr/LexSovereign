DO $$
BEGIN
    -- 1. Add status to Document
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Document' AND column_name='status') THEN
        ALTER TABLE "Document" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'AI_DRAFTED';
    END IF;

    -- 2. Ensure DocumentTemplate.tenantId column exists (for backrelation support)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='DocumentTemplate' AND column_name='tenantId') THEN
        ALTER TABLE "DocumentTemplate" ADD COLUMN "tenantId" TEXT;
        ALTER TABLE "DocumentTemplate" ADD CONSTRAINT "DocumentTemplate_tenantId_fkey"
            FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
