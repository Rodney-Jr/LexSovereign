---
description: How to build the server locally in a clean state
---

Follow these steps to ensure a clean build and avoid persistent TypeScript or Prisma errors.

1.  **Navigate to the server directory**
    `cd server`

2.  **Clean previous build artifacts**
    Run the following command to remove old transpiled code and generated Prisma clients:
    `rm -rf dist node_modules/.prisma`

3.  **Ensure dependencies and Prisma client are up to date**
    `npm install`
    `npx prisma generate`

4.  **Run the build**
    `npm run build`

> [!TIP]
> If you still see errors related to old field names, try `npx prisma generate` again and restart your IDE's TypeScript server.
