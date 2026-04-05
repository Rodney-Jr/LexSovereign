import { useState, useEffect } from 'react';

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
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3005';
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

  const commitToNomosDesk = (htmlContent: string) => {
    // Utilize BroadcastChannel API to send payload back without CORS issues
    const channel = new BroadcastChannel('sovereign_studio_sync');
    channel.postMessage({
        type: 'STUDIO_COMMIT',
        payload: htmlContent
    });
    
    // Close the drafting focus window to return to main platform
    alert('Document committed to Sovereign Vault successfully.');
    setTimeout(() => {
        window.close();
    }, 500);
  };

  return { isReady, documentData, commitToNomosDesk, error };
}
