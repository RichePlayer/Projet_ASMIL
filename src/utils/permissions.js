// Permissions utility for RBAC system - Admin & Secretary only

export const PERMISSIONS = {
    // Students
    STUDENTS_VIEW: 'students.view',
    STUDENTS_CREATE: 'students.create',
    STUDENTS_EDIT: 'students.edit',
    STUDENTS_DELETE: 'students.delete',

    // Teachers
    TEACHERS_VIEW: 'teachers.view',
    TEACHERS_CREATE: 'teachers.create',
    TEACHERS_EDIT: 'teachers.edit',
    TEACHERS_DELETE: 'teachers.delete',

    // Formations
    FORMATIONS_VIEW: 'formations.view',
    FORMATIONS_CREATE: 'formations.create',
    FORMATIONS_EDIT: 'formations.edit',
    FORMATIONS_DELETE: 'formations.delete',

    // Modules
    MODULES_VIEW: 'modules.view',
    MODULES_CREATE: 'modules.create',
    MODULES_EDIT: 'modules.edit',
    MODULES_DELETE: 'modules.delete',

    // Sessions
    SESSIONS_VIEW: 'sessions.view',
    SESSIONS_CREATE: 'sessions.create',
    SESSIONS_EDIT: 'sessions.edit',
    SESSIONS_DELETE: 'sessions.delete',

    // Invoices
    INVOICES_VIEW: 'invoices.view',
    INVOICES_CREATE: 'invoices.create',
    INVOICES_EDIT: 'invoices.edit',
    INVOICES_DELETE: 'invoices.delete',

    // Grades
    GRADES_VIEW: 'grades.view',
    GRADES_CREATE: 'grades.create',
    GRADES_EDIT: 'grades.edit',
    GRADES_DELETE: 'grades.delete',

    // Attendance
    ATTENDANCE_VIEW: 'attendance.view',
    ATTENDANCE_CREATE: 'attendance.create',
    ATTENDANCE_EDIT: 'attendance.edit',

    // Certificates
    CERTIFICATES_VIEW: 'certificates.view',
    CERTIFICATES_CREATE: 'certificates.create',

    // Announcements
    ANNOUNCEMENTS_VIEW: 'announcements.view',
    ANNOUNCEMENTS_CREATE: 'announcements.create',
    ANNOUNCEMENTS_EDIT: 'announcements.edit',
    ANNOUNCEMENTS_DELETE: 'announcements.delete',

    // Timetable
    TIMETABLE_VIEW: 'timetable.view',
    TIMETABLE_CREATE: 'timetable.create',
    TIMETABLE_EDIT: 'timetable.edit',

    // Users (Admin only)
    USERS_VIEW: 'users.view',
    USERS_CREATE: 'users.create',
    USERS_EDIT: 'users.edit',
    USERS_DELETE: 'users.delete',

    // System (Admin only)
    SYSTEM_SETTINGS: 'system.settings',
    SYSTEM_LOGS: 'system.logs',
    SYSTEM_BACKUPS: 'system.backups',
    FINANCE_VIEW: 'finance.view',
};

// Role-based permission sets - ONLY Admin and Gestionnaire (Secretary)
export const ROLE_PERMISSIONS = {
    Admin: Object.values(PERMISSIONS), // Admin has all permissions

    Gestionnaire: [
        // Students - Full access
        PERMISSIONS.STUDENTS_VIEW,
        PERMISSIONS.STUDENTS_CREATE,
        PERMISSIONS.STUDENTS_EDIT,
        PERMISSIONS.STUDENTS_DELETE,

        // Invoices - Full access
        PERMISSIONS.INVOICES_VIEW,
        PERMISSIONS.INVOICES_CREATE,
        PERMISSIONS.INVOICES_EDIT,

        // Grades - Full access
        PERMISSIONS.GRADES_VIEW,
        PERMISSIONS.GRADES_CREATE,
        PERMISSIONS.GRADES_EDIT,

        // Attendance - Full access
        PERMISSIONS.ATTENDANCE_VIEW,
        PERMISSIONS.ATTENDANCE_CREATE,
        PERMISSIONS.ATTENDANCE_EDIT,

        // Certificates - Full access
        PERMISSIONS.CERTIFICATES_VIEW,
        PERMISSIONS.CERTIFICATES_CREATE,

        // Announcements - Full access
        PERMISSIONS.ANNOUNCEMENTS_VIEW,
        PERMISSIONS.ANNOUNCEMENTS_CREATE,
        PERMISSIONS.ANNOUNCEMENTS_EDIT,
        PERMISSIONS.ANNOUNCEMENTS_DELETE,

        // Timetable - Full access
        PERMISSIONS.TIMETABLE_VIEW,
        PERMISSIONS.TIMETABLE_CREATE,
        PERMISSIONS.TIMETABLE_EDIT,
    ],
};

/**
 * Check if a user has a specific permission
 * @param {Object} user - User object with role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export const hasPermission = (user, permission) => {
    if (!user || !user.role) return false;
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return userPermissions.includes(permission);
};

/**
 * Check if a user has any of the specified permissions
 * @param {Object} user - User object with role
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean}
 */
export const hasAnyPermission = (user, permissions) => {
    return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Check if a user has all of the specified permissions
 * @param {Object} user - User object with role
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean}
 */
export const hasAllPermissions = (user, permissions) => {
    return permissions.every(permission => hasPermission(user, permission));
};

/**
 * Get all permissions for a user
 * @param {Object} user - User object with role
 * @returns {string[]}
 */
export const getUserPermissions = (user) => {
    if (!user || !user.role) return [];
    return ROLE_PERMISSIONS[user.role] || [];
};
