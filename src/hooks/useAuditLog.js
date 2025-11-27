import { logAction } from '@/utils/auditLog';
import { useAuth } from '@/context/AuthContext';
import { useCallback } from 'react';

/**
 * Hook to log audit actions
 */
export const useAuditLog = () => {
    const { user } = useAuth();

    const log = useCallback((action, details = {}) => {
        return logAction(action, details, user);
    }, [user]);

    return { log };
};
