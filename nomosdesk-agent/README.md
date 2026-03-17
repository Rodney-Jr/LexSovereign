# NomosDesk Local Sync Agent

The NomosDesk Local Sync Agent is a lightweight daemon that automatically synchronizes documents from a local folder to your NomosDesk Knowledge Enclave.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+) installed on your local machine or server.
- Access to the NomosDesk Dashboard to generate an API Key.

### 2. Installation
1. Navigate to the agent directory:
   ```bash
   cd nomosdesk-agent
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### 3. Configuration
1. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and configure the following variables:
   - `API_URL`: The URL of your NomosDesk platform (e.g., `https://app.nomosdesk.com` or `http://localhost:3001`).
   - `WATCH_DIR`: The absolute path to the local folder you want to monitor (e.g., `C:\Documents\Ingest` or `/mnt/shares/docs`).
   - `AGENT_API_KEY`: The API Key generated from **Tenant Settings > Agent Sync** in the NomosDesk UI.
   - `DEFAULT_MATTER_ID`: (Optional) The ID of a specific matter to auto-assign all synced documents to.

### 4. Running the Agent
Start the agent in development mode:
```bash
npm run dev
```
Or build and run for production:
```bash
npm run build
npm start
```

## 📂 File Lifecycle
The agent creates three subdirectories in your `WATCH_DIR`:
- `_processing/`: Files currently being uploaded.
- `_completed/`: Files successfully synced to NomosDesk.
- `_error/`: Files that failed to upload (check logs for details).

## 🛡️ Security
- All communications are encrypted via HTTPS (if configured).
- Authentication is handled via the secure `x-api-key` header.
- The agent only reads files from the explicitly configured `WATCH_DIR`.
