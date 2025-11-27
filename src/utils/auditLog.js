// Audit logging utility

export const LOG_ACTIONS = {
    // Auth
    LOGIN: 'auth.login',
    LOGOUT: 'auth.logout',
    LOGIN_FAILED: 'auth.login_failed',

    // Users
    USER_CREATE: 'user.create',
    USER_UPDATE: 'user.update',
    USER_DELETE: 'user.delete',
    USER_ACTIVATE: 'user.activate',
    USER_DEACTIVATE: 'user.deactivate',
    PASSWORD_RESET: 'user.password_reset',

    // Students
    STUDENT_CREATE: 'student.create',
    STUDENT_UPDATE: 'student.update',
    STUDENT_DELETE: 'student.delete',

    // Teachers
    TEACHER_CREATE: 'teacher.create',
    TEACHER_UPDATE: 'teacher.update',
    TEACHER_DELETE: 'teacher.delete',

    // Formations
    FORMATION_CREATE: 'formation.create',
    FORMATION_UPDATE: 'formation.update',
    FORMATION_DELETE: 'formation.delete',

    // Invoices
    INVOICE_CREATE: 'invoice.create',
    INVOICE_UPDATE: 'invoice.update',
    INVOICE_DELETE: 'invoice.delete',

    // Payments
    PAYMENT_CREATE: 'payment.create',
    PAYMENT_UPDATE: 'payment.update',

    // System
    SETTINGS_UPDATE: 'system.settings_update',
    BACKUP_CREATE: 'system.backup_create',
    BACKUP_RESTORE: 'system.backup_restore',
    DATA_EXPORT: 'system.data_export',

    // Permissions
    PERMISSION_UPDATE: 'permission.update',
};

/**
 * Log an action to localStorage (for demo purposes)
 * In production, this would send to a backend API
 */
export const logAction = (action, details = {}, user = null) => {
    const logEntry = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        action,
        timestamp: new Date().toISOString(),
        user: user ? {
            id: user.id,
            name: user.full_name,
            email: user.email,
            role: user.role,
        } : null,
        details,
        ip: 'localhost', // In production, get from request
        userAgent: navigator.userAgent,
    };

    // Get existing logs
    const logs = getAuditLogs();

    // Add new log
    logs.unshift(logEntry);

    // Keep only last 1000 logs
    const trimmedLogs = logs.slice(0, 1000);

    // Save to localStorage
    try {
        localStorage.setItem('asmil_audit_logs', JSON.stringify(trimmedLogs));
    } catch (error) {
        console.error('Failed to save audit log:', error);
    }

    return logEntry;
};

/**
 * Get all audit logs
 */
export const getAuditLogs = () => {
    try {
        const logs = localStorage.getItem('asmil_audit_logs');
        return logs ? JSON.parse(logs) : [];
    } catch (error) {
        console.error('Failed to get audit logs:', error);
        return [];
    }
};

/**
 * Filter audit logs
 */
export const filterAuditLogs = (filters = {}) => {
    let logs = getAuditLogs();

    // Filter by user
    if (filters.userId) {
        logs = logs.filter(log => log.user?.id === filters.userId);
    }

    // Filter by action
    if (filters.action) {
        logs = logs.filter(log => log.action === filters.action);
    }

    // Filter by action category
    if (filters.category) {
        logs = logs.filter(log => log.action.startsWith(filters.category + '.'));
    }

    // Filter by date range
    if (filters.startDate) {
        logs = logs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
        logs = logs.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
    }

    // Search in details
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        logs = logs.filter(log =>
            JSON.stringify(log).toLowerCase().includes(searchLower)
        );
    }

    return logs;
};

/**
 * Clear all audit logs (Admin only)
 */
export const clearAuditLogs = () => {
    try {
        localStorage.removeItem('asmil_audit_logs');
        return true;
    } catch (error) {
        console.error('Failed to clear audit logs:', error);
        return false;
    }
};

/**
 * Export audit logs to JSON
 */
export const exportAuditLogs = (filters = {}) => {
    const logs = filters ? filterAuditLogs(filters) : getAuditLogs();
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
};
