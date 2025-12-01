const express = require('express');
const router = express.Router();
const {
    createAnnouncement,
    getAllAnnouncements,
    getAnnouncementById,
    updateAnnouncement,
    deleteAnnouncement,
    getActiveAnnouncements
} = require('../controllers/announcementController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/announcements/active
 * @desc    Obtenir les annonces actives (route publique)
 * @access  Public
 * @query   target_audience
 */
router.get('/active', getActiveAnnouncements);

// Toutes les autres routes nécessitent une authentification
router.use(authenticateToken);

/**
 * @route   POST /api/announcements
 * @desc    Créer une nouvelle annonce
 * @access  Admin
 */
router.post('/', authorizeRole(['Admin']), createAnnouncement);

/**
 * @route   GET /api/announcements
 * @desc    Obtenir toutes les annonces avec filtres
 * @access  Admin, Gestionnaire
 * @query   page, limit, type, target_audience, published, active
 */
router.get('/', authorizeRole(['Admin', 'Gestionnaire']), getAllAnnouncements);

/**
 * @route   GET /api/announcements/:id
 * @desc    Obtenir une annonce par ID
 * @access  Admin, Gestionnaire
 */
router.get('/:id', authorizeRole(['Admin', 'Gestionnaire']), getAnnouncementById);

/**
 * @route   PUT /api/announcements/:id
 * @desc    Mettre à jour une annonce
 * @access  Admin
 */
router.put('/:id', authorizeRole(['Admin']), updateAnnouncement);

/**
 * @route   DELETE /api/announcements/:id
 * @desc    Supprimer une annonce
 * @access  Admin
 */
router.delete('/:id', authorizeRole(['Admin']), deleteAnnouncement);

module.exports = router;
