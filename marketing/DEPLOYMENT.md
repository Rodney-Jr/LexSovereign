# LexSovereign Marketing Website Deployment

This website is designed to be hosted as a separate service within your Railway project `Remarkable-tenderness`.

## Deployment Steps

1.  **Railway Dashboard**:
    - Go to your Railway project.
    - Click **New** -> **GitHub Repo**.
    - Select your `LexSovereign` repository.
2.  **Service Configuration**:
    - Once the service is added, go to its **Settings**.
    - Under **General**, find **Root Directory** and set it to `marketing`.
    - Railway will automatically detect the Vite project.
3.  **Environment**:
    - Ensure your main platform is accessible at `http://localhost:5173` (or update the link in `App.tsx` to your production platform URL).
4.  **Domains**:
    - Railway will provide a default domain (e.g., `lexsovereign-marketing.up.railway.app`). You can bind your custom marketing domain here.

## Project Structure
- `marketing/`: The root for this marketing service.
- `marketing/src/App.tsx`: The main high-fidelity landing page.
- `marketing/src/index.css`: Premium design system tokens.
