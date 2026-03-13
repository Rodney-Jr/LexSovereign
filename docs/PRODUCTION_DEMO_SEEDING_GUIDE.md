# Managing Production Demo Tenants

The production demo seed script allows you to reliably instantiate fully populated, persisting demo accounts for both Law Firm and Enterprise workflows on your live instance.

## Changes Made
- Created `server/src/scripts/seedProductionDemos.ts`.
- The script uses Prisma's `upsert` mechanism heavily, making it fully **idempotent**. This ensures that re-running the script will never duplicate records, and the demo tenants are guaranteed to persist.
- Hardcoded deterministic IDs (e.g., `demo-tenant-lawfirm`) are used to ensure the relationships between Users, Matters, Roles, and Documents remain stable across runs.

### Seeded Organizations
1. **Apex Law Partners** (Law Firm)
   - 5 Internal Users (Managing Partner, Senior Associate, Junior Associate, Paralegal, Finance Manager).
   - 3 External Clients (TechFlow SA, Global Mining Co., Oaks & Partners Ltd.).
   - 3 Matters with corresponding initial documents.
2. **Global Logistics Corp** (Enterprise)
   - 5 Internal Users (General Counsel, Senior Counsel, Contract Manager, Compliance Officer, Legal Ops).
   - 3 Internal/External Clients (HR Department, IT Department, Vendor Alpha).
   - 3 Matters with corresponding initial documents.

*All created demo users have the universal password: `DemoPassword123!`*

## How to Run on Production (Railway)
Since NomosDesk backend is deployed on Railway, use the following steps to execute this seeder in your production environment:

1. Copy the newest code to your deployment target (trigger a redeploy on Railway).
2. Open the **Railway Dashboard**.
3. Go to the NomosDesk **Server** service.
4. Click on the **Variables** tab (or Command Palette) and select **Open default shell**.
5. Run the following command in the production shell:
   ```bash
   npx ts-node src/scripts/seedProductionDemos.ts
   ```
