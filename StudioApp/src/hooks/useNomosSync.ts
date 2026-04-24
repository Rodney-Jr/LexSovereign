import { useState, useEffect } from 'react';
import { getRuntimeConfig } from '../utils/runtimeConfig';

export function useNomosSync() {
  const [isReady, setIsReady] = useState(false);
  const [documentData, setDocumentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search || window.location.hash.split('?')[1]);
    let token = params.get('token');
    const docId = params.get('docId');
    const matterId = params.get('matterId');
    const title = params.get('title');

    // Persist token to sessionStorage for the life of this tab/window to handle SPA redirects
    if (token) {
        sessionStorage.setItem('nomos_studio_handshake', token);
    } else {
        token = sessionStorage.getItem('nomos_studio_handshake');
    }

    if (!token) {
      setError('Unauthorized access. Missing Sovereign JWT Handshake.');
      return;
    }

    // Verify token & Handshake
    const verifyHandshake = async () => {
        try {
            let initialContent = '';
            if (docId) {
                const baseUrl = getRuntimeConfig('VITE_API_URL');
                if (!baseUrl) {
                    setError('API URL not configured for production. Handshake aborted.');
                    return;
                }
                const response = await fetch(`${baseUrl}/api/documents/${docId}/content`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                initialContent = data.content || '';
            }

            setDocumentData({
                docId,
                matterId,
                title: title || 'Untitled_Draft.docx',
                content: initialContent
            });
            setIsReady(true);
        } catch (e) {
            console.error('Handshake error:', e);
            setError('Sovereign Handshake Failed: Could not fetch initial document content.');
        }
    };

    verifyHandshake();
  }, []);

  const [isCommitting, setIsCommitting] = useState(false);

  const commitToNomosDesk = async (htmlContent: string, savedDocId?: string) => {
    if (isCommitting) return;
    setIsCommitting(true);

    // Utilize BroadcastChannel API to send payload back without CORS issues
    const channel = new BroadcastChannel('sovereign_studio_sync');
    channel.postMessage({
        type: 'STUDIO_COMMIT',
        docId: savedDocId || documentData?.docId,
        content: htmlContent
    });
    
    // Close the drafting focus window to return to main platform
    // In a real app we might wait for an 'ACK' from the host, but for now we follow the "Capture and Close" pattern
    setTimeout(() => {
        window.close();
    }, 800);
  };

  return { isReady, documentData, commitToNomosDesk, error };
}
