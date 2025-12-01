const express = require('express');
const router = express.Router();
const {
    createEnrollment,
    getAllEnrollments,
    getEnrollmentById,
    updateEnrollment,
    deleteEnrollment,
    getEnrollmentBalance
} = require('../controllers/enrollmentController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

/**
 * @route   POST /api/enrollments
 * @desc    Créer une nouvelle inscription
 * @access  Admin, Gestionnaire
 */
router.post('/', authorizeRole(['Admin', 'Gestionnaire']), createEnrollment);

/**
 * @route   GET /api/enrollments
 * @desc    Obtenir toutes les inscriptions avec filtres
 * @access  Admin, Gestionnaire
 * @query   page, limit, student_id, session_id, status
 */
router.get('/', authorizeRole(['Admin', 'Gestionnaire']), getAllEnrollments);

/**
 * @route   GET /api/enrollments/:id
 * @desc    Obtenir une inscription par ID
 * @access  Admin, Gestionnaire
 */
router.get('/:id', authorizeRole(['Admin', 'Gestionnaire']), getEnrollmentById);

/**
 * @route   GET /api/enrollments/:id/balance
 * @desc    Obtenir le solde d'une inscription
 * @access  Admin, Gestionnaire
 */
router.get('/:id/balance', authorizeRole(['Admin', 'Gestionnaire']), getEnrollmentBalance);

/**
 * @route   PUT /api/enrollments/:id
 * @desc    Mettre à jour une inscription
 * @access  Admin, Gestionnaire
 */
router.put('/:id', authorizeRole(['Admin', 'Gestionnaire']), updateEnrollment);

/**
 * @route   DELETE /api/enrollments/:id
 * @desc    Supprimer une inscription
 * @access  Admin
 */
router.delete('/:id', authorizeRole(['Admin']), deleteEnrollment);

module.exports = router;
