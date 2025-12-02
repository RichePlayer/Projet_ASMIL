const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Créer un nouveau log d'audit
 */
const createAuditLog = async (req, res) => {
    try {
        const {
            user_id,
            user_name,
            user_email,
            action,
            category,
            entity_type,
            entity_id,
            ip_address,
            user_agent,
            details,
            status
        } = req.body;

        const auditLog = await prisma.auditLog.create({
            data: {
                user_id: user_id ? parseInt(user_id) : null,
                user_name,
                user_email,
                action,
                category,
                entity_type,
                entity_id: entity_id ? parseInt(entity_id) : null,
                ip_address,
                user_agent,
                details: details || {},
                status: status || 'success'
            }
        });

        res.status(201).json({
            message: 'Log d\'audit créé avec succès',
            auditLog
        });
    } catch (error) {
        console.error('Erreur création log d\'audit:', error);
        res.status(500).json({ message: 'Échec de la création du log', error: error.message });
    }
};

/**
 * Obtenir tous les logs d'audit avec filtres et pagination
 */
const getAllAuditLogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            category,
            action,
            user_id,
            status,
            start_date,
            end_date,
            search
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = {};

        if (category) where.category = category;
        if (action) where.action = action;
        if (user_id) where.user_id = parseInt(user_id);
        if (status) where.status = status;

        if (start_date && end_date) {
            where.created_at = {
                gte: new Date(start_date),
                lte: new Date(end_date)
            };
        }

        if (search) {
            where.OR = [
                { user_name: { contains: search, mode: 'insensitive' } },
                { user_email: { contains: search, mode: 'insensitive' } },
                { action: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [auditLogs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { created_at: 'desc' }
            }),
            prisma.auditLog.count({ where })
        ]);

        res.json({
            auditLogs,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Erreur récupération logs d\'audit:', error);
        res.status(500).json({ message: 'Échec de la récupération des logs', error: error.message });
    }
};

/**
 * Obtenir un log d'audit par ID
 */
const getAuditLogById = async (req, res) => {
    try {
        const { id } = req.params;

        const auditLog = await prisma.auditLog.findUnique({
            where: { id: parseInt(id) }
        });

        if (!auditLog) {
            return res.status(404).json({ message: 'Log d\'audit non trouvé' });
        }

        res.json({ auditLog });
    } catch (error) {
        console.error('Erreur récupération log d\'audit:', error);
        res.status(500).json({ message: 'Échec de la récupération du log', error: error.message });
    }
};

/**
 * Supprimer un log d'audit
 */
const deleteAuditLog = async (req, res) => {
    try {
        const { id } = req.params;

        const auditLog = await prisma.auditLog.findUnique({
            where: { id: parseInt(id) }
        });

        if (!auditLog) {
            return res.status(404).json({ message: 'Log d\'audit non trouvé' });
        }

        await prisma.auditLog.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Log d\'audit supprimé avec succès' });
    } catch (error) {
        console.error('Erreur suppression log d\'audit:', error);
        res.status(500).json({ message: 'Échec de la suppression du log', error: error.message });
    }
};

/**
 * Supprimer les anciens logs (plus de 90 jours)
 */
const clearOldLogs = async (req, res) => {
    try {
        const { days = 90 } = req.query;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

        const result = await prisma.auditLog.deleteMany({
            where: {
                created_at: {
                    lt: cutoffDate
                }
            }
        });

        res.json({
            message: `Logs de plus de ${days} jours supprimés avec succès`,
            deletedCount: result.count
        });
    } catch (error) {
        console.error('Erreur nettoyage logs:', error);
        res.status(500).json({ message: 'Échec du nettoyage des logs', error: error.message });
    }
};

/**
 * Obtenir les statistiques des logs d'audit
 */
const getAuditStats = async (req, res) => {
    try {
        const total = await prisma.auditLog.count();

        // Logs par catégorie
        const byCategory = await prisma.auditLog.groupBy({
            by: ['category'],
            _count: true
        });

        // Logs par statut
        const byStatus = await prisma.auditLog.groupBy({
            by: ['status'],
            _count: true
        });

        // Logs aujourd'hui
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCount = await prisma.auditLog.count({
            where: {
                created_at: { gte: today }
            }
        });

        // Logs cette semaine
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekCount = await prisma.auditLog.count({
            where: {
                created_at: { gte: weekAgo }
            }
        });

        // Échecs de connexion
        const failedLogins = await prisma.auditLog.count({
            where: {
                action: 'auth.login_failed'
            }
        });

        res.json({
            statistics: {
                total,
                todayCount,
                weekCount,
                failedLogins,
                byCategory,
                byStatus
            }
        });
    } catch (error) {
        console.error('Erreur statistiques logs:', error);
        res.status(500).json({ message: 'Échec de la récupération des statistiques', error: error.message });
    }
};

module.exports = {
    createAuditLog,
    getAllAuditLogs,
    getAuditLogById,
    deleteAuditLog,
    clearOldLogs,
    getAuditStats
};
