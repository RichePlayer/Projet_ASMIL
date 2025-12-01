const express = require('express');
const router = express.Router();
const {
    createCertificate,
    getAllCertificates,
    getCertificateById,
    verifyCertificate,
    updateCertificate,
    deleteCertificate
} = require('../controllers/certificateController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/certificates/verify/:certificate_number
 * @desc    Vérifier l'authenticité d'un certificat (route publique)
 * @access  Public
 */
router.get('/verify/:certificate_number', verifyCertificate);

// Toutes les autres routes nécessitent une authentification
router.use(authenticateToken);

/**
 * @route   POST /api/certificates
 * @desc    Créer un nouveau certificat
 * @access  Admin, Gestionnaire
 */
router.post('/', authorizeRole(['Admin', 'Gestionnaire']), createCertificate);

/**
 * @route   GET /api/certificates
 * @desc    Obtenir tous les certificats avec filtres
 * @access  Admin, Gestionnaire
 * @query   page, limit, student_id, formation_id, status
 */
router.get('/', authorizeRole(['Admin', 'Gestionnaire']), getAllCertificates);

/**
 * @route   GET /api/certificates/:id
 * @desc    Obtenir un certificat par ID
 * @access  Admin, Gestionnaire
 */
router.get('/:id', authorizeRole(['Admin', 'Gestionnaire']), getCertificateById);

/**
 * @route   PUT /api/certificates/:id
 * @desc    Mettre à jour un certificat
 * @access  Admin
 */
router.put('/:id', authorizeRole(['Admin']), updateCertificate);

/**
 * @route   DELETE /api/certificates/:id
 * @desc    Supprimer un certificat
 * @access  Admin
 */
router.delete('/:id', authorizeRole(['Admin']), deleteCertificate);

module.exports = router;
