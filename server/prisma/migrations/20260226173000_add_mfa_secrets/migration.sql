DO $$
BEGIN
    -- 1. Add mfaSecret to User
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='mfaSecret') THEN
        ALTER TABLE "User" ADD COLUMN "mfaSecret" TEXT;
    END IF;

    -- 2. Add mfaBackupCodes to User
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='mfaBackupCodes') THEN
        ALTER TABLE "User" ADD COLUMN "mfaBackupCodes" JSONB DEFAULT '[]';
    END IF;
END $$;
