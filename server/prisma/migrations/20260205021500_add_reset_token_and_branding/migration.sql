-- AlterTable
ALTER TABLE "User" ADD COLUMN "resetToken" TEXT,
ADD COLUMN "resetTokenExpires" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "BrandingProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "primaryFont" TEXT NOT NULL DEFAULT 'Times New Roman',
    "headerText" TEXT,
    "footerText" TEXT,
    "coverPageEnabled" BOOLEAN NOT NULL DEFAULT false,
    "watermarkText" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandingProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");

-- AddForeignKey
ALTER TABLE "BrandingProfile" ADD CONSTRAINT "BrandingProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
