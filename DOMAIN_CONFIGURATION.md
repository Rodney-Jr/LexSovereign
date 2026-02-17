# Domain Configuration Guide (Railway)

This guide details how to configure custom domains for the **NomosDesk** architecture on Railway.

## Architecture Overview

| Component | Architecture | Railway Service Type | Recommended Domain |
| :--- | :--- | :--- | :--- |
| **Platform** (App + API) | Monolith (Express serving Vite Dist) | Node.js / Docker | `app.nomosdesk.com` |
| **Marketing Site** | Static SPA (Vite) | Node.js (Static) | `www.nomosdesk.com` |

---

## 1. Platform Configuration (App + API)

The main platform (`nomosdesk-architecture`) serves both the React frontend and the Express API from a single service.

### Step 1: Railway Dashboard
1.  Navigate to your Project -> Select the **Platform Service**.
2.  Go to **Settings** -> **Networking**.
3.  Click **Custom Domain**.
4.  Enter your subdomain: `app.nomosdesk.com`.

### Step 2: DNS Records
Login to your DNS provider (Cloudflare, GoDaddy, Namecheap) and add:

| Type | Name | Value | TTL |
| :--- | :--- | :--- | :--- |
| **CNAME** | `app` | `{{railway-service-domain}}.up.railway.app` | Auto / 1 Hour |

*(Replace `{{railway-service-domain}}` with the actual domain provided by Railway settings)*

### Step 3: Environment Variables (Critical)
Update the following variables in the Platform Service to ensure authentication and links work:

- `VITE_PLATFORM_URL`: `https://app.nomosdesk.com`
- `CORS_ORIGIN`: `https://app.nomosdesk.com` (If utilizing `cors` middleware restriction)

### Step 4: Google OAuth (If Applicable)
Update your Google Cloud Console Credentials:
- **Authorized JavaScript Origins**: `https://app.nomosdesk.com`
- **Authorized Redirect URIs**: `https://app.nomosdesk.com/api/auth/google/callback`

---

## 2. Marketing Site Configuration

The marketing site (`nomosdesk-marketing`) is a separate static site deployment.

### Step 1: Railway Dashboard
1.  Navigate to your Project -> Select the **Marketing Service** (Create a new service if needed, rooted in `/marketing`).
2.  Go to **Settings** -> **Networking**.
3.  Click **Custom Domain**.
4.  Enter your root domain or `www` subdomain: `www.nomosdesk.com`.

### Step 2: DNS Records

| Type | Name | Value | TTL |
| :--- | :--- | :--- | :--- |
| **CNAME** | `www` | `{{marketing-service-domain}}.up.railway.app` | Auto / 1 Hour |
| **CNAME** (Optional) | `@` (Root) | `{{marketing-service-domain}}.up.railway.app` | Auto / 1 Hour |

*(Note: Standard DNS providers like GoDaddy do not support CNAME records for the root domain `@`. Use one of the workarounds below if using GoDaddy.)*

#### GoDaddy Root Domain Workaround
If your domain is with GoDaddy, choice **A** is highly recommended:

- **A: Delegate to Cloudflare (Best)**: Change your GoDaddy nameservers to Cloudflare. Cloudflare supports "CNAME Flattening" on the root `@`, allowing a direct CNAME to Railway.
- **B: URL Forwarding (Simple)**: 
    1. Set CNAME for `www` to `wq06hy42.up.railway.app`.
    2. In GoDaddy, go to **Forwarding** and point `nomosdesk.com` (root) to `https://www.nomosdesk.com`.

### Step 3: Build Settings
Ensure the service is configured correctly:
- **Root Directory**: `/marketing`
- **Build Command**: `npm run build`
- **Start Command**: `npm run start` (or `vite preview --port $PORT --host`)

---

## Configuration Review Checklist

### 1. Railway Settings
- [ ] **Platform Service**:
    - Networking -> Custom Domain: `app.nomosdesk.com`
    - Networking -> Port: `3001`
    - Variables -> `VITE_PLATFORM_URL`: `https://app.nomosdesk.com`
- [ ] **Marketing Service**:
    - Networking -> Custom Domain: `www.nomosdesk.com`
    - Networking -> Port: `4173`
    - Variables -> `VITE_API_URL`: `https://app.nomosdesk.com`

### 2. GoDaddy DNS Settings
- [ ] **CNAME Records**:
    - Host: `www` | Points to: `wq06hy42.up.railway.app`
    - Host: `app` | Points to: `(Platform Service Domain).up.railway.app`
- [ ] **Forwarding** (at the bottom of DNS settings):
    - Domain: `nomosdesk.com` -> `https://www.nomosdesk.com`
    - Type: `Permanent (301)`
    - Settings: `Forward only`

---

## Summary
- **User Login**: `https://app.nomosdesk.com`
- **Public Website**: `https://www.nomosdesk.com`
- **Root Redirect**: `nomosdesk.com` -> `www.nomosdesk.com`
- **API Endpoint**: `https://app.nomosdesk.com/api/...`
