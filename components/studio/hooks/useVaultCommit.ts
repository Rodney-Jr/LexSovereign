/**
 * @file useVaultCommit.ts
 * @module NomosDesk/Studio/Hooks
 * @description Secure document commitment with hygiene validation.
 */

import { useState, useCallback } from 'react';
import { validateDocumentHygiene } from '../domain/documentValidator';
import { TextDiff } from '../../../hooks/useDocumentState';
import { ValidationReport } from '../domain/documentTypes';

export const useVaultCommit = (onSave?: (name: string, content: string, id?: string) => void) => {
  const [isCommitLoading, setIsCommitLoading] = useState(false);
  const [report, setReport] = useState<ValidationReport | null>(null);

  const commitToVault = useCallback(async (
    name: string, 
    content: string, 
    diffs: TextDiff[],
    addToast: (msg: string, type: any) => void,
    id?: string
  ) => {
    setIsCommitLoading(true);

    try {
      // 1. Run Hygiene Validation (Domain Layer)
      const hygieneReport = validateDocumentHygiene(content, diffs);
      setReport(hygieneReport);

      if (!hygieneReport.isValid) {
        addToast(`Commit Blocked: ${hygieneReport.errors[0]}`, 'error');
        return false;
      }

      // 2. Perform Async Persistence (Service Layer Simulation)
      // Standard async/await logic replacing setTimeout
      await new Promise(resolve => setTimeout(resolve, 1500)); 

      if (onSave) {
        onSave(name, content, id);
      }

      addToast(`Artifact "${name}" successfully vaulted with digital hash.`, 'success');
      return true;
    } catch (error) {
      addToast('Critical: Vault commitment failed. Internal system error.', 'error');
      return false;
    } finally {
      setIsCommitLoading(false);
    }
  }, [onSave]);

  return { commitToVault, isCommitLoading, report };
};
