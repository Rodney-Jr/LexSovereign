import { useState, useEffect } from 'react';
import { DocumentMetadata, Matter, RegulatoryRule } from '../types';
import { INITIAL_DOCS, INITIAL_MATTERS, INITIAL_RULES } from '../constants';
import { authorizedFetch, getSavedSession } from '../utils/api';

export const useSovereignData = (isAuthenticated: boolean) => {
    const [documents, setDocuments] = useState<DocumentMetadata[]>(INITIAL_DOCS);
    const [matters, setMatters] = useState<Matter[]>(INITIAL_MATTERS);
    const [rules, setRules] = useState<RegulatoryRule[]>(INITIAL_RULES);

    useEffect(() => {
        const fetchData = async () => {
            const session = getSavedSession();
            if (!session?.token) return;

            try {
                const [mattersData, docsData, rulesData] = await Promise.all([
                    authorizedFetch('/api/matters', { token: session.token }),
                    authorizedFetch('/api/documents', { token: session.token }),
                    authorizedFetch('/api/rules', { token: session.token })
                ]);

                if (Array.isArray(mattersData)) setMatters(mattersData);
                if (Array.isArray(docsData)) setDocuments(docsData);
                if (Array.isArray(rulesData)) setRules(rulesData);
            } catch (e) {
                console.error("[Data] Failed to fetch sovereign data", e);
            }
        };

        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated]);

    const addDocument = (doc: DocumentMetadata) => setDocuments(prev => [...prev, doc]);
    const removeDocument = (id: string) => setDocuments(prev => prev.filter(d => d.id !== id));
    const addMatter = (matter: Matter) => setMatters(prev => [...prev, matter]);

    const createDocument = async (docData: Partial<DocumentMetadata>) => {
        const session = getSavedSession();
        if (!session?.token) throw new Error("No active session");

        try {
            const newDoc = await authorizedFetch('/api/documents', {
                token: session.token,
                method: 'POST',
                body: JSON.stringify(docData)
            });
            setDocuments(prev => [newDoc, ...prev]);
            return newDoc;
        } catch (e) {
            console.error("[Data] Failed to create document", e);
            throw e;
        }
    };

    return {
        documents,
        matters,
        rules,
        addDocument,
        removeDocument,
        addMatter,
        createDocument
    };
};
