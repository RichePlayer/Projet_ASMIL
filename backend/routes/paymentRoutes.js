const express = require('express');
const router = express.Router();
const {
    createPayment,
    getAllPayments,
    getPaymentById,
    updatePayment,
    deletePayment,
    getPaymentStats
} = require('../controllers/paymentController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

/**
 * @route   POST /api/payments
 * @desc    Créer un nouveau paiement
 * @access  Admin, Gestionnaire
 */
router.post('/', authorizeRole(['Admin', 'Gestionnaire']), createPayment);

/**
 * @route   GET /api/payments
 * @desc    Obtenir tous les paiements avec filtres
 * @access  Admin, Gestionnaire
 * @query   page, limit, invoice_id, method, start_date, end_date
 */
router.get('/', authorizeRole(['Admin', 'Gestionnaire']), getAllPayments);

/**
 * @route   GET /api/payments/stats
 * @desc    Obtenir les statistiques de paiements
 * @access  Admin
 * @query   start_date, end_date
 */
router.get('/stats', authorizeRole(['Admin']), getPaymentStats);

/**
 * @route   GET /api/payments/:id
 * @desc    Obtenir un paiement par ID
 * @access  Admin, Gestionnaire
 */
router.get('/:id', authorizeRole(['Admin', 'Gestionnaire']), getPaymentById);

/**
 * @route   PUT /api/payments/:id
 * @desc    Mettre à jour un paiement
 * @access  Admin
 */
router.put('/:id', authorizeRole(['Admin']), updatePayment);

/**
 * @route   DELETE /api/payments/:id
 * @desc    Supprimer un paiement
 * @access  Admin
 */
router.delete('/:id', authorizeRole(['Admin']), deletePayment);

module.exports = router;
