/**
 * @file CollabService.ts
 * @module NomosDesk/Server/Services
 * @description Real-time CRDT Synchronization Engine powered by Y.js.
 * @version 1.5.4 (Traditional y-websocket backend integration)
 */

import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
// @ts-ignore - Importing from y-websocket bin utils for traditional room management
import { setupWSConnection } from 'y-websocket/bin/utils';
import { Server } from 'http';

/**
 * CollabService manages the Y.js document enclaves.
 * This enables multi-user real-time sync for DraftingStudio documents.
 */
export class CollabService {
  private static wss: WebSocketServer | null = null;

  /**
   * Initialize Y.js WebSocket Server
   * This hooks into the main HTTP server to handle /collab/:room upgrades.
   */
  static init(server: Server) {
    console.log("[COLLAB] Initializing Y.js WebSocket Enclave...");
    
    // Create an internal WSS that handles upgrades manually
    this.wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (request, socket, head) => {
      const url = new URL(request.url || '', `http://${request.headers.host}`);
      const pathname = url.pathname;

      if (pathname.startsWith('/collab/')) {
        this.wss?.handleUpgrade(request, socket, head, (ws) => {
          const roomName = pathname.split('/').pop() || 'global';
          console.log(`[COLLAB] Syncing Room: ${roomName}`);
          
          // setupWSConnection handles the protocol handshake and sync steps
          setupWSConnection(ws, request, { docName: roomName });
        });
      }
    });

    console.log("[COLLAB] Ready for incoming synchronization heartbeats.");
  }
}
