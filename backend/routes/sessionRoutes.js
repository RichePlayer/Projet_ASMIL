const express = require('express');
const router = express.Router();
const {
    createSession,
    getAllSessions,
    getSessionById,
    updateSession,
    deleteSession,
    getSessionStats
} = require('../controllers/sessionController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

/**
 * @route   POST /api/sessions
 * @desc    Créer une nouvelle session
 * @access  Admin, Gestionnaire
 */
router.post('/', authorizeRole(['Admin', 'Gestionnaire']), createSession);

/**
 * @route   GET /api/sessions
 * @desc    Obtenir toutes les sessions avec filtres
 * @access  Admin, Gestionnaire
 * @query   page, limit, formation_id, teacher_id, status, start_date, end_date
 */
router.get('/', authorizeRole(['Admin', 'Gestionnaire']), getAllSessions);

/**
 * @route   GET /api/sessions/:id
 * @desc    Obtenir une session par ID
 * @access  Admin, Gestionnaire
 */
router.get('/:id', authorizeRole(['Admin', 'Gestionnaire']), getSessionById);

/**
 * @route   GET /api/sessions/:id/stats
 * @desc    Obtenir les statistiques d'une session
 * @access  Admin, Gestionnaire
 */
router.get('/:id/stats', authorizeRole(['Admin', 'Gestionnaire']), getSessionStats);

/**
 * @route   PUT /api/sessions/:id
 * @desc    Mettre à jour une session
 * @access  Admin, Gestionnaire
 */
router.put('/:id', authorizeRole(['Admin', 'Gestionnaire']), updateSession);

/**
 * @route   DELETE /api/sessions/:id
 * @desc    Supprimer une session
 * @access  Admin
 */
router.delete('/:id', authorizeRole(['Admin']), deleteSession);

module.exports = router;
