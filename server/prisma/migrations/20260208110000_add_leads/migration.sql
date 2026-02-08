-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "source" TEXT NOT NULL DEFAULT 'WEB_MODAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);
