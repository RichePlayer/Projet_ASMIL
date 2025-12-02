const express = require('express');
const router = express.Router();
const {
    getAllModules,
    createModule,
    updateModule,
    deleteModule
} = require('../controllers/moduleController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// GET /api/modules - List all modules
router.get('/', getAllModules);

// POST /api/modules - Create a module (Admin only)
router.post('/', authorizeRole(['Admin']), createModule);

// PUT /api/modules/:id - Update a module (Admin only)
router.put('/:id', authorizeRole(['Admin']), updateModule);

// DELETE /api/modules/:id - Delete a module (Admin only)
router.delete('/:id', authorizeRole(['Admin']), deleteModule);

module.exports = router;
