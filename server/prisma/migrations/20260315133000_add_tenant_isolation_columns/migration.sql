-- ActivityEntry
ALTER TABLE "ActivityEntry" ADD COLUMN "tenantId" TEXT;
UPDATE "ActivityEntry" ae SET "tenantId" = m."tenantId" FROM "Matter" m WHERE ae."matterId" = m.id;
ALTER TABLE "ActivityEntry" ALTER COLUMN "tenantId" SET NOT NULL;

-- AIRiskAnalysis
ALTER TABLE "AIRiskAnalysis" ADD COLUMN "tenantId" TEXT;
UPDATE "AIRiskAnalysis" ara SET "tenantId" = m."tenantId" FROM "Matter" m WHERE ara."matterId" = m.id;
ALTER TABLE "AIRiskAnalysis" ALTER COLUMN "tenantId" SET NOT NULL;

-- Approval
ALTER TABLE "Approval" ADD COLUMN "tenantId" TEXT;
UPDATE "Approval" a SET "tenantId" = m."tenantId" FROM "Matter" m WHERE a."matterId" = m.id;
ALTER TABLE "Approval" ALTER COLUMN "tenantId" SET NOT NULL;

-- AuditLog (Optional)
ALTER TABLE "AuditLog" ADD COLUMN "tenantId" TEXT;
UPDATE "AuditLog" al SET "tenantId" = m."tenantId" FROM "Matter" m WHERE al."matterId" = m.id AND al."tenantId" IS NULL;

-- CaseMetadata
ALTER TABLE "CaseMetadata" ADD COLUMN "tenantId" TEXT;
UPDATE "CaseMetadata" cm SET "tenantId" = m."tenantId" FROM "Matter" m WHERE cm."matterId" = m.id;
ALTER TABLE "CaseMetadata" ALTER COLUMN "tenantId" SET NOT NULL;

-- ContractMetadata
ALTER TABLE "ContractMetadata" ADD COLUMN "tenantId" TEXT;
UPDATE "ContractMetadata" cm SET "tenantId" = m."tenantId" FROM "Matter" m WHERE cm."matterId" = m.id;
ALTER TABLE "ContractMetadata" ALTER COLUMN "tenantId" SET NOT NULL;

-- Deadline
ALTER TABLE "Deadline" ADD COLUMN "tenantId" TEXT;
UPDATE "Deadline" d SET "tenantId" = m."tenantId" FROM "Matter" m WHERE d."matterId" = m.id;
ALTER TABLE "Deadline" ALTER COLUMN "tenantId" SET NOT NULL;

-- Document
ALTER TABLE "Document" ADD COLUMN "tenantId" TEXT;
UPDATE "Document" d SET "tenantId" = m."tenantId" FROM "Matter" m WHERE d."matterId" = m.id;
ALTER TABLE "Document" ALTER COLUMN "tenantId" SET NOT NULL;

-- DocumentVersion
ALTER TABLE "DocumentVersion" ADD COLUMN "tenantId" TEXT;
UPDATE "DocumentVersion" dv SET "tenantId" = d."tenantId" FROM "Document" d WHERE dv."documentId" = d.id;
ALTER TABLE "DocumentVersion" ALTER COLUMN "tenantId" SET NOT NULL;

-- EvidenceLink
ALTER TABLE "EvidenceLink" ADD COLUMN "tenantId" TEXT;
UPDATE "EvidenceLink" el SET "tenantId" = m."tenantId" FROM "Matter" m WHERE el."matterId" = m.id;
ALTER TABLE "EvidenceLink" ALTER COLUMN "tenantId" SET NOT NULL;

-- Hearing
ALTER TABLE "Hearing" ADD COLUMN "tenantId" TEXT;
UPDATE "Hearing" h SET "tenantId" = m."tenantId" FROM "Matter" m WHERE h."matterId" = m.id;
ALTER TABLE "Hearing" ALTER COLUMN "tenantId" SET NOT NULL;

-- Task
ALTER TABLE "Task" ADD COLUMN "tenantId" TEXT;
UPDATE "Task" t SET "tenantId" = m."tenantId" FROM "Matter" m WHERE t."matterId" = m.id;
ALTER TABLE "Task" ALTER COLUMN "tenantId" SET NOT NULL;

-- TimeEntry
ALTER TABLE "TimeEntry" ADD COLUMN "tenantId" TEXT;
UPDATE "TimeEntry" te SET "tenantId" = m."tenantId" FROM "Matter" m WHERE te."matterId" = m.id;
ALTER TABLE "TimeEntry" ALTER COLUMN "tenantId" SET NOT NULL;
