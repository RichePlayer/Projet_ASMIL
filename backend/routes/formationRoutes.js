const express = require('express');
const router = express.Router();
const {
    createFormation,
    getAllFormations,
    getFormationById,
    updateFormation,
    deleteFormation,
    addModule,
    updateModule,
    deleteModule,
    getAllCategories,
    createCategory
} = require('../controllers/formationController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

/**
 * Routes publiques - Consultation des formations
 */

/**
 * @route   GET /api/formations
 * @desc    Obtenir toutes les formations avec filtres
 * @access  Public
 * @query   page, limit, category_id, type, search
 */
router.get('/', getAllFormations);

/**
 * @route   GET /api/formations/categories/all
 * @desc    Obtenir toutes les catégories
 * @access  Public
 */
router.get('/categories/all', getAllCategories);

/**
 * @route   GET /api/formations/:id
 * @desc    Obtenir une formation par ID
 * @access  Public
 */
router.get('/:id', getFormationById);

/**
 * Routes protégées - Gestion des formations (Admin uniquement)
 */
router.use(authenticateToken);

/**
 * @route   POST /api/formations
 * @desc    Créer une nouvelle formation
 * @access  Admin
 */
router.post('/', authorizeRole(['Admin']), createFormation);

/**
 * @route   PUT /api/formations/:id
 * @desc    Mettre à jour une formation
 * @access  Admin
 */
router.put('/:id', authorizeRole(['Admin']), updateFormation);

/**
 * @route   DELETE /api/formations/:id
 * @desc    Supprimer une formation
 * @access  Admin
 */
router.delete('/:id', authorizeRole(['Admin']), deleteFormation);

/**
 * @route   POST /api/formations/:id/modules
 * @desc    Ajouter un module à une formation
 * @access  Admin
 */
router.post('/:id/modules', authorizeRole(['Admin']), addModule);

/**
 * @route   PUT /api/formations/modules/:moduleId
 * @desc    Mettre à jour un module
 * @access  Admin
 */
router.put('/modules/:moduleId', authorizeRole(['Admin']), updateModule);

/**
 * @route   DELETE /api/formations/modules/:moduleId
 * @desc    Supprimer un module
 * @access  Admin
 */
router.delete('/modules/:moduleId', authorizeRole(['Admin']), deleteModule);

/**
 * @route   POST /api/formations/categories
 * @desc    Créer une catégorie
 * @access  Admin
 */
router.post('/categories', authorizeRole(['Admin']), createCategory);

module.exports = router;
