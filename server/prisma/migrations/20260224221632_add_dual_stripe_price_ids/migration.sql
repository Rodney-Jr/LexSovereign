/*
  Warnings:

  - You are about to drop the column `stripePriceId` on the `PricingConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PricingConfig" DROP COLUMN "stripePriceId",
ADD COLUMN     "stripeBasePriceId" TEXT,
ADD COLUMN     "stripeUserPriceId" TEXT;
