-- DropIndex
DROP INDEX "Role_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_tenantId_key" ON "Role"("name", "tenantId");
