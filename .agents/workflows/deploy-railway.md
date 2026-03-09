---
description: How to deploy NomosDesk to Railway
---

Deployment to Railway uses the project's `Dockerfile` and `railway.json` configuration. Follow these steps to ensure a successful push and deployment.

1.  **Commit and push all changes**
    Ensure all build fixes are committed to the `master` branch:
    `git add .`
    `git commit -m "Deployment v1.0.2 - Fixed build errors and updated service facade"`
    `git push origin master`

2.  **Verify the deployment in Railway Dashboard**
    - Go to your Railway project.
    - Confirm the deployment for the `LexSovereign` service has started.

3.  **Redeploy with No Cache (Recommended for schema changes)**
    If you see persistent TypeScript errors in the Railway logs, it may be due to cached layers. To fix:
    - Click on the `Deployment` in the Railway dashboard.
    - Select **Redeploy with No Cache**.

4.  **Confirm database migration successfully ran**
    The deployment start command includes a migration step. Verify the logs show:
    `npx prisma migrate deploy`
    `Prisma schema loaded from prisma/schema.prisma`
    `✔ Generated Prisma Client`
