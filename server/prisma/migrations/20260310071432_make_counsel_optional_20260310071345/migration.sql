-- DropForeignKey
ALTER TABLE "Matter" DROP CONSTRAINT "Matter_internalCounselId_fkey";

-- AlterTable
ALTER TABLE "Matter" ALTER COLUMN "internalCounselId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Matter" ADD CONSTRAINT "Matter_internalCounselId_fkey" FOREIGN KEY ("internalCounselId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
