import { hasPermission, getUserPermissions } from '@/utils/permissions';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook to check permissions - Admin and Secretary only
 */
export const usePermissions = () => {
    const { user } = useAuth();

    const checkPermission = (permission) => {
        return hasPermission(user, permission);
    };

    const checkAnyPermission = (permissions) => {
        return permissions.some(p => hasPermission(user, p));
    };

    const checkAllPermissions = (permissions) => {
        return permissions.every(p => hasPermission(user, p));
    };

    const permissions = getUserPermissions(user);

    return {
        hasPermission: checkPermission,
        hasAnyPermission: checkAnyPermission,
        hasAllPermissions: checkAllPermissions,
        permissions,
        isAdmin: user?.role === 'Admin',
        isSecretary: user?.role === 'Gestionnaire',
    };
};
