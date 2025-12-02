const express = require('express');
const router = express.Router();
const {
    createAuditLog,
    getAllAuditLogs,
    getAuditLogById,
    deleteAuditLog,
    clearOldLogs,
    getAuditStats
} = require('../controllers/auditLogController');

/**
 * Routes pour la gestion des logs d'audit
 * Base URL: /api/audit-logs
 */

// Obtenir les statistiques des logs
router.get('/stats', getAuditStats);

// Obtenir tous les logs avec filtres et pagination
router.get('/', getAllAuditLogs);

// Obtenir un log par ID
router.get('/:id', getAuditLogById);

// Créer un nouveau log
router.post('/', createAuditLog);

// Supprimer un log
router.delete('/:id', deleteAuditLog);

// Nettoyer les anciens logs
router.delete('/cleanup/old', clearOldLogs);

module.exports = router;
