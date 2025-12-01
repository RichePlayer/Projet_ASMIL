const express = require('express');
const router = express.Router();
const {
    createInvoice,
    getAllInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,
    getOverdueInvoices,
    getFinancialStats
} = require('../controllers/invoiceController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

/**
 * @route   POST /api/invoices
 * @desc    Créer une nouvelle facture
 * @access  Admin, Gestionnaire
 */
router.post('/', authorizeRole(['Admin', 'Gestionnaire']), createInvoice);

/**
 * @route   GET /api/invoices
 * @desc    Obtenir toutes les factures avec filtres
 * @access  Admin, Gestionnaire
 * @query   page, limit, enrollment_id, status, overdue
 */
router.get('/', authorizeRole(['Admin', 'Gestionnaire']), getAllInvoices);

/**
 * @route   GET /api/invoices/overdue
 * @desc    Obtenir les factures en retard
 * @access  Admin, Gestionnaire
 */
router.get('/overdue', authorizeRole(['Admin', 'Gestionnaire']), getOverdueInvoices);

/**
 * @route   GET /api/invoices/stats
 * @desc    Obtenir les statistiques financières
 * @access  Admin
 * @query   start_date, end_date
 */
router.get('/stats', authorizeRole(['Admin']), getFinancialStats);

/**
 * @route   GET /api/invoices/:id
 * @desc    Obtenir une facture par ID
 * @access  Admin, Gestionnaire
 */
router.get('/:id', authorizeRole(['Admin', 'Gestionnaire']), getInvoiceById);

/**
 * @route   PUT /api/invoices/:id
 * @desc    Mettre à jour une facture
 * @access  Admin, Gestionnaire
 */
router.put('/:id', authorizeRole(['Admin', 'Gestionnaire']), updateInvoice);

/**
 * @route   DELETE /api/invoices/:id
 * @desc    Supprimer une facture
 * @access  Admin
 */
router.delete('/:id', authorizeRole(['Admin']), deleteInvoice);

module.exports = router;
