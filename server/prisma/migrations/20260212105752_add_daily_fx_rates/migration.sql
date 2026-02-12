-- CreateTable
CREATE TABLE "DailyFxRate" (
    "id" TEXT NOT NULL,
    "currencyPair" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'EXCHANGERATE_API',
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyFxRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyFxRate_currencyPair_effectiveDate_key" ON "DailyFxRate"("currencyPair", "effectiveDate");
