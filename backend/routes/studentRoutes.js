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
 * @access  Admin, Gestionnaire
 */
router.post('/', authorizeRole(['Admin', 'Gestionnaire']), createStudent);

/**
 * @route   GET /api/students
 * @desc    Obtenir tous les étudiants avec pagination et filtres
 * @access  Admin, Gestionnaire
 * @query   page, limit, status, search
 */
router.get('/', authorizeRole(['Admin', 'Gestionnaire']), getAllStudents);

/**
 * @route   GET /api/students/:id
 * @desc    Obtenir un étudiant par ID avec toutes ses informations
 * @access  Admin, Gestionnaire
 */
router.get('/:id', authorizeRole(['Admin', 'Gestionnaire']), getStudentById);

/**
 * @route   GET /api/students/:id/stats
 * @desc    Obtenir les statistiques d'un étudiant
 * @access  Admin, Gestionnaire
 */
router.get('/:id/stats', authorizeRole(['Admin', 'Gestionnaire']), getStudentStats);

/**
 * @route   PUT /api/students/:id
 * @desc    Mettre à jour un étudiant
 * @access  Admin, Gestionnaire
 */
router.put('/:id', authorizeRole(['Admin', 'Gestionnaire']), updateStudent);

/**
 * @route   DELETE /api/students/:id
 * @desc    Supprimer un étudiant
 * @access  Admin uniquement
 */
router.delete('/:id', authorizeRole(['Admin']), deleteStudent);

module.exports = router;
