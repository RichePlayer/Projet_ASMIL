import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * Higher-Order Component to protect routes based on permissions
 */
export default function PermissionGuard({
    children,
    permission,
    permissions,
    requireAll = false,
    fallback = null,
    redirectTo = '/dashboard'
}) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    let hasAccess = false;

    if (permission) {
        // Single permission check
        hasAccess = hasPermission(permission);
    } else if (permissions) {
        // Multiple permissions check
        hasAccess = requireAll
            ? hasAllPermissions(permissions)
            : hasAnyPermission(permissions);
    } else {
        // No permission specified, allow access
        hasAccess = true;
    }

    if (!hasAccess) {
        if (fallback) {
            return fallback;
        }
        return <Navigate to={redirectTo} replace />;
    }

    return children;
}
