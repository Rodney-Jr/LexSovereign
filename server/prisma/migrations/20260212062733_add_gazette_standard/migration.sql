-- AlterTable
ALTER TABLE "DocumentTemplate" ALTER COLUMN "structure" DROP DEFAULT;

-- CreateTable
CREATE TABLE "GazetteEmbedding" (
    "id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentChunk" TEXT NOT NULL,
    "embedding" JSONB,
    "sourceUrl" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GazetteEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GazetteEmbedding_region_idx" ON "GazetteEmbedding"("region");
