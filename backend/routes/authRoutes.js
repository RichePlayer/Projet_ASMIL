const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route example (for verification)
router.get('/me', authenticateToken, (req, res) => {
    res.json({
        message: 'This is a protected route',
        user: req.user
    });
});

// User Management Routes (Admin only ideally, but for now authenticated)
const { getAllUsers, updateUser, deleteUser, updateUserStatus, resetPassword, updateProfile, changePassword, uploadAvatar } = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');

// Profile management routes (for authenticated users to manage their own profile)
router.put('/profile/:id', authenticateToken, updateProfile);
router.put('/change-password/:id', authenticateToken, changePassword);
router.post('/upload-avatar/:id', authenticateToken, upload.single('avatar'), uploadAvatar);

router.get('/users', authenticateToken, getAllUsers);
router.put('/users/:id', authenticateToken, updateUser);
router.delete('/users/:id', authenticateToken, deleteUser);
router.put('/users/:id/status', authenticateToken, updateUserStatus);
router.put('/users/:id/reset-password', authenticateToken, resetPassword);

module.exports = router;
