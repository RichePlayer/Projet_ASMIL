const express = require('express');
const router = express.Router();
const {
    createGrade,
    getAllGrades,
    getGradeById,
    updateGrade,
    deleteGrade,
    calculateEnrollmentAverage,
    getStudentReport
} = require('../controllers/gradeController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

/**
 * @route   POST /api/grades
 * @desc    Créer une nouvelle note
 * @access  Admin, Gestionnaire
 */
router.post('/', authorizeRole(['Admin', 'Gestionnaire']), createGrade);

/**
 * @route   GET /api/grades
 * @desc    Obtenir toutes les notes avec filtres
 * @access  Admin, Gestionnaire
 * @query   page, limit, enrollment_id, start_date, end_date
 */
router.get('/', authorizeRole(['Admin', 'Gestionnaire']), getAllGrades);

/**
 * @route   GET /api/grades/:id
 * @desc    Obtenir une note par ID
 * @access  Admin, Gestionnaire
 */
router.get('/:id', authorizeRole(['Admin', 'Gestionnaire']), getGradeById);

/**
 * @route   GET /api/grades/enrollment/:enrollment_id/average
 * @desc    Calculer la moyenne d'un étudiant
 * @access  Admin, Gestionnaire
 */
router.get('/enrollment/:enrollment_id/average', authorizeRole(['Admin', 'Gestionnaire']), calculateEnrollmentAverage);

/**
 * @route   GET /api/grades/enrollment/:enrollment_id/report
 * @desc    Obtenir le bulletin d'un étudiant
 * @access  Admin, Gestionnaire
 */
router.get('/enrollment/:enrollment_id/report', authorizeRole(['Admin', 'Gestionnaire']), getStudentReport);

/**
 * @route   PUT /api/grades/:id
 * @desc    Mettre à jour une note
 * @access  Admin, Gestionnaire
 */
router.put('/:id', authorizeRole(['Admin', 'Gestionnaire']), updateGrade);

/**
 * @route   DELETE /api/grades/:id
 * @desc    Supprimer une note
 * @access  Admin
 */
router.delete('/:id', authorizeRole(['Admin']), deleteGrade);

module.exports = router;
