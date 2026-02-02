-- AlterTable
ALTER TABLE "DocumentTemplate" DROP COLUMN "placeholders",
ADD COLUMN     "structure" JSONB NOT NULL DEFAULT '[]';

-- CreateTable
CREATE TABLE "PricingConfig" (
    "id" TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "pricePerUser" DOUBLE PRECISION NOT NULL,
    "creditsIncluded" INTEGER NOT NULL DEFAULT 0,
    "features" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingConfig_pkey" PRIMARY KEY ("id")
);
