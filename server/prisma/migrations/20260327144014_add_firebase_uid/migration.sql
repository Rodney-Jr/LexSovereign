/*
  Safe migration: Add firebaseUid with backfill for existing users
  - Drop old auth columns (passwordHash, resetToken, etc.)
  - Add firebaseUid as nullable first, backfill with uuid(), then constrain
*/

-- DropIndex (safe - may not exist)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'User_resetToken_key') THEN
    DROP INDEX "User_resetToken_key";
  END IF;
END $$;

-- Safely drop old auth columns (only if they exist)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='mfaSecret') THEN
    ALTER TABLE "User" DROP COLUMN "mfaSecret";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='passwordHash') THEN
    ALTER TABLE "User" DROP COLUMN "passwordHash";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='provider') THEN
    ALTER TABLE "User" DROP COLUMN "provider";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='providerId') THEN
    ALTER TABLE "User" DROP COLUMN "providerId";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='resetToken') THEN
    ALTER TABLE "User" DROP COLUMN "resetToken";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='resetTokenExpires') THEN
    ALTER TABLE "User" DROP COLUMN "resetTokenExpires";
  END IF;
END $$;

-- Add firebaseUid as nullable first (to handle existing rows)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='firebaseUid') THEN
    ALTER TABLE "User" ADD COLUMN "firebaseUid" TEXT;
  END IF;
END $$;

-- Backfill existing users with a placeholder unique UID (they will need to be re-provisioned)
UPDATE "User" SET "firebaseUid" = 'legacy-' || gen_random_uuid()::text WHERE "firebaseUid" IS NULL;

-- Now add NOT NULL constraint
ALTER TABLE "User" ALTER COLUMN "firebaseUid" SET NOT NULL;

-- CreateIndex
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'User_firebaseUid_key') THEN
    CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");
  END IF;
END $$;
