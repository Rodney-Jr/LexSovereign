# Google OAuth Setup Guide

## Overview
NomosDesk supports Google OAuth for streamlined authentication. This is **optional** - the application works perfectly with email/password authentication if OAuth is not configured.

## Current Status
- **Warning**: `[Auth] Google OAuth is disabled - no valid Client ID found`
- **Impact**: None - email/password login is fully functional
- **Fix**: Set `VITE_GOOGLE_CLIENT_ID` environment variable

## Setup Instructions

### 1. Obtain Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if prompted
6. Select **Web application** as the application type
7. Add authorized JavaScript origins:
   - `http://localhost:5173` (local development)
   - `https://your-production-domain.com` (production)
8. Add authorized redirect URIs:
   - `http://localhost:5173` (local development)
   - `https://your-production-domain.com` (production)
9. Click **Create** and copy the **Client ID**

### 2. Configure Environment Variables

#### Local Development
Add to `.env.local`:
```env
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

#### Railway Production
1. Go to your Railway project
2. Navigate to **Variables**
3. Add new variable:
   - **Key**: `VITE_GOOGLE_CLIENT_ID`
   - **Value**: `your-client-id-here.apps.googleusercontent.com`
4. Redeploy the application

### 3. Verify Setup

After configuration:
1. Restart your development server (if local)
2. Open the browser console
3. The warning should be gone
4. You should see a "Sign in with Google" button on the login page

## Troubleshooting

### Warning Still Appears
- Ensure the environment variable name is exactly `VITE_GOOGLE_CLIENT_ID`
- Vite requires the `VITE_` prefix for client-side variables
- Restart the dev server after adding the variable

### OAuth Button Not Working
- Check that your domain is in the authorized origins list
- Verify the Client ID is correct
- Check browser console for CORS errors

## Security Notes
- Never commit the Client ID to version control (it's in `.env.local` which is gitignored)
- The Client ID is safe to expose in client-side code (it's not a secret)
- The OAuth flow is secure and doesn't expose sensitive credentials
