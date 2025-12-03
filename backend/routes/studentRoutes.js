const express = require('express');
const router = express.Router();
const {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getStudentStats
} = require('../controllers/studentController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

/**
 * @route   POST /api/students
 * @desc    Créer un nouvel étudiant
 * @access  Admin, Gestionnaire, Secretary
 */
router.post('/', authorizeRole(['Admin', 'Gestionnaire', 'Secretary']), createStudent);

/**
 * @route   GET /api/students
 * @desc    Obtenir tous les étudiants avec pagination et filtres
 * @access  Admin, Gestionnaire, Secretary
 * @query   page, limit, status, search
 */
router.get('/', authorizeRole(['Admin', 'Gestionnaire', 'Secretary']), getAllStudents);

/**
 * @route   GET /api/students/:id
 * @desc    Obtenir un étudiant par ID avec toutes ses informations
 * @access  Admin, Gestionnaire, Secretary
 */
router.get('/:id', authorizeRole(['Admin', 'Gestionnaire', 'Secretary']), getStudentById);

/**
 * @route   GET /api/students/:id/stats
 * @desc    Obtenir les statistiques d'un étudiant
 * @access  Admin, Gestionnaire, Secretary
 */
router.get('/:id/stats', authorizeRole(['Admin', 'Gestionnaire', 'Secretary']), getStudentStats);

/**
 * @route   PUT /api/students/:id
 * @desc    Mettre à jour un étudiant
 * @access  Admin, Gestionnaire, Secretary
 */
router.put('/:id', authorizeRole(['Admin', 'Gestionnaire', 'Secretary']), updateStudent);

/**
 * @route   DELETE /api/students/:id
 * @desc    Supprimer un étudiant
 * @access  Admin uniquement
 */
router.delete('/:id', authorizeRole(['Admin']), deleteStudent);

module.exports = router;
