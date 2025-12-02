// API utility for audit logs
import api from '@/services/api';

const AUDIT_LOG_API = '/api/audit-logs';

/**
 * Créer un nouveau log d'audit
 */
export const createAuditLog = async (logData) => {
    try {
        const response = await api.post(AUDIT_LOG_API, logData);
        return response.data;
    } catch (error) {
        console.error('Erreur création log d\'audit:', error);
        throw error;
    }
};

/**
 * Obtenir tous les logs d'audit avec filtres et pagination
 */
export const getAllAuditLogs = async (params = {}) => {
    try {
        const response = await api.get(AUDIT_LOG_API, { params });
        return response.data;
    } catch (error) {
        console.error('Erreur récupération logs d\'audit:', error);
        throw error;
    }
};

/**
 * Obtenir un log d'audit par ID
 */
export const getAuditLogById = async (id) => {
    try {
        const response = await api.get(`${AUDIT_LOG_API}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Erreur récupération log d\'audit:', error);
        throw error;
    }
};

/**
 * Supprimer un log d'audit
 */
export const deleteAuditLog = async (id) => {
    try {
        const response = await api.delete(`${AUDIT_LOG_API}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Erreur suppression log d\'audit:', error);
        throw error;
    }
};

/**
 * Nettoyer les anciens logs
 */
export const clearOldLogs = async (days = 90) => {
    try {
        const response = await api.delete(`${AUDIT_LOG_API}/cleanup/old`, {
            params: { days }
        });
        return response.data;
    } catch (error) {
        console.error('Erreur nettoyage logs:', error);
        throw error;
    }
};

/**
 * Obtenir les statistiques des logs d'audit
 */
export const getAuditStats = async () => {
    try {
        const response = await api.get(`${AUDIT_LOG_API}/stats`);
        return response.data;
    } catch (error) {
        console.error('Erreur statistiques logs:', error);
        throw error;
    }
};

/**
 * Helper pour logger une action depuis le frontend
 */
export const logAction = async (action, details = {}) => {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        const logData = {
            user_id: user.id || null,
            user_name: user.full_name || null,
            user_email: user.email || null,
            action,
            category: action.split('.')[0], // Extract category from action (e.g., 'auth' from 'auth.login')
            details,
            ip_address: 'localhost', // In production, this would be set by backend
            user_agent: navigator.userAgent,
            status: 'success'
        };

        return await createAuditLog(logData);
    } catch (error) {
        console.error('Erreur lors de la création du log:', error);
        // Don't throw - logging should not break the application
    }
};

// Export log action constants for consistency
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
