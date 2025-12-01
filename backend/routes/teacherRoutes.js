const express = require('express');
const router = express.Router();
const {
    createTeacher,
    getAllTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher,
    getTeacherStats,
    getTeacherAvailability
} = require('../controllers/teacherController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

/**
 * @route   POST /api/teachers
 * @desc    Créer un nouvel enseignant
 * @access  Admin
 */
router.post('/', authorizeRole(['Admin']), createTeacher);

/**
 * @route   GET /api/teachers
 * @desc    Obtenir tous les enseignants avec filtres
 * @access  Admin, Gestionnaire
 * @query   page, limit, status, specialty, search
 */
router.get('/', authorizeRole(['Admin', 'Gestionnaire']), getAllTeachers);

/**
 * @route   GET /api/teachers/:id
 * @desc    Obtenir un enseignant par ID
 * @access  Admin, Gestionnaire
 */
router.get('/:id', authorizeRole(['Admin', 'Gestionnaire']), getTeacherById);

/**
 * @route   GET /api/teachers/:id/stats
 * @desc    Obtenir les statistiques d'un enseignant
 * @access  Admin, Gestionnaire
 */
router.get('/:id/stats', authorizeRole(['Admin', 'Gestionnaire']), getTeacherStats);

/**
 * @route   GET /api/teachers/:id/availability
 * @desc    Obtenir la disponibilité d'un enseignant
 * @access  Admin, Gestionnaire
 * @query   start_date, end_date
 */
router.get('/:id/availability', authorizeRole(['Admin', 'Gestionnaire']), getTeacherAvailability);

/**
 * @route   PUT /api/teachers/:id
 * @desc    Mettre à jour un enseignant
 * @access  Admin
 */
router.put('/:id', authorizeRole(['Admin']), updateTeacher);

/**
 * @route   DELETE /api/teachers/:id
 * @desc    Supprimer un enseignant
 * @access  Admin
 */
router.delete('/:id', authorizeRole(['Admin']), deleteTeacher);

module.exports = router;
