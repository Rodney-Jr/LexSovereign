DO $$
BEGIN
    -- 1. Add lastActiveAt to User
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='lastActiveAt') THEN
        ALTER TABLE "User" ADD COLUMN "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- 2. Add mfaEnabled to User
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='mfaEnabled') THEN
        ALTER TABLE "User" ADD COLUMN "mfaEnabled" BOOLEAN NOT NULL DEFAULT false;
    END IF;

    -- 3. Add attributes to Tenant
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Tenant' AND column_name='attributes') THEN
        ALTER TABLE "Tenant" ADD COLUMN "attributes" JSONB DEFAULT '{}';
    END IF;

    -- 4. Create Bridge table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='Bridge') THEN
        CREATE TABLE "Bridge" (
            "id"            TEXT NOT NULL,
            "name"          TEXT NOT NULL,
            "category"      TEXT NOT NULL,
            "provider"      TEXT NOT NULL,
            "status"        TEXT NOT NULL DEFAULT 'Nominal',
            "encapsulation" TEXT NOT NULL,
            "priority"      TEXT NOT NULL DEFAULT 'P0',
            "lastActivity"  TEXT,
            "tenantId"      TEXT,
            "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "Bridge_pkey" PRIMARY KEY ("id")
        );

        -- Foreign key to Tenant
        ALTER TABLE "Bridge"
            ADD CONSTRAINT "Bridge_tenantId_fkey"
            FOREIGN KEY ("tenantId")
            REFERENCES "Tenant"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
