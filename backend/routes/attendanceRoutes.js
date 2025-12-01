const express = require('express');
const router = express.Router();
const {
    createAttendance,
    getAllAttendances,
    getAttendanceById,
    updateAttendance,
    deleteAttendance,
    getStudentAttendanceRate,
    bulkCreateAttendances
} = require('../controllers/attendanceController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

/**
 * @route   POST /api/attendances
 * @desc    Enregistrer une présence
 * @access  Admin, Gestionnaire
 */
router.post('/', authorizeRole(['Admin', 'Gestionnaire']), createAttendance);

/**
 * @route   POST /api/attendances/bulk
 * @desc    Enregistrer les présences en masse pour une session
 * @access  Admin, Gestionnaire
 */
router.post('/bulk', authorizeRole(['Admin', 'Gestionnaire']), bulkCreateAttendances);

/**
 * @route   GET /api/attendances
 * @desc    Obtenir toutes les présences avec filtres
 * @access  Admin, Gestionnaire
 * @query   page, limit, enrollment_id, status, start_date, end_date
 */
router.get('/', authorizeRole(['Admin', 'Gestionnaire']), getAllAttendances);

/**
 * @route   GET /api/attendances/:id
 * @desc    Obtenir une présence par ID
 * @access  Admin, Gestionnaire
 */
router.get('/:id', authorizeRole(['Admin', 'Gestionnaire']), getAttendanceById);

/**
 * @route   GET /api/attendances/enrollment/:enrollment_id/rate
 * @desc    Obtenir le taux de présence d'un étudiant
 * @access  Admin, Gestionnaire
 */
router.get('/enrollment/:enrollment_id/rate', authorizeRole(['Admin', 'Gestionnaire']), getStudentAttendanceRate);

/**
 * @route   PUT /api/attendances/:id
 * @desc    Mettre à jour une présence
 * @access  Admin, Gestionnaire
 */
router.put('/:id', authorizeRole(['Admin', 'Gestionnaire']), updateAttendance);

/**
 * @route   DELETE /api/attendances/:id
 * @desc    Supprimer une présence
 * @access  Admin
 */
router.delete('/:id', authorizeRole(['Admin']), deleteAttendance);

module.exports = router;
