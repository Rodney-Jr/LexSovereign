-- Migration to revert from Firebase Auth to Native Auth (passwordHash)
-- Re-add passwordHash column (nullable as per current schema)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;

-- Remove unique index on firebaseUid
DROP INDEX IF EXISTS "User_firebaseUid_key";

-- Drop firebaseUid column (not in current schema)
ALTER TABLE "User" DROP COLUMN IF EXISTS "firebaseUid";
