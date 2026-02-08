-- CreateTable
CREATE TABLE "ChatbotConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "botName" TEXT NOT NULL,
    "welcomeMessage" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "channels" JSONB NOT NULL,
    "knowledgeBaseIds" JSONB NOT NULL,
    "systemInstruction" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatbotConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatbotConfig_tenantId_key" ON "ChatbotConfig"("tenantId");

-- AddForeignKey
ALTER TABLE "ChatbotConfig" ADD CONSTRAINT "ChatbotConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
