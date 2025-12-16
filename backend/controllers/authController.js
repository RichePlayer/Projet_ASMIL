const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword, generateToken } = require('../utils/passwordUtils');

const prisma = new PrismaClient();

const register = async (req, res) => {
    try {
        const { full_name, email, password, role } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const password_hash = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                full_name,
                email,
                password_hash,
                role: role || 'Gestionnaire', // Default role
                status: 'active'
            }
        });

        const token = generateToken(user);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.status !== 'active') {
            return res.status(403).json({ message: 'Votre compte est désactivé. Veuillez contacter l\'administrateur.' });
        }

        const isMatch = await comparePassword(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { last_login: new Date() }
        });

        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                full_name: true,
                email: true,
                role: true,
                status: true,
                last_login: true,
                created_at: true
            },
            orderBy: { created_at: 'desc' }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, email, role } = req.body;

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { full_name, email, role },
            select: {
                id: true,
                full_name: true,
                email: true,
                role: true,
                status: true,
                last_login: true,
                created_at: true
            }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const userToDelete = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });

        if (!userToDelete) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        if (userToDelete.email === 'admin@asmil.mg') {
            return res.status(403).json({ message: 'Impossible de supprimer l\'administrateur principal.' });
        }

        await prisma.user.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { status },
            select: {
                id: true,
                full_name: true,
                email: true,
                role: true,
                status: true,
                last_login: true,
                created_at: true
            }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user status', error: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
        }

        const password_hash = await hashPassword(password);

        await prisma.user.update({
            where: { id: parseInt(id) },
            data: { password_hash }
        });

        res.json({ message: 'Mot de passe réinitialisé avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe', error: error.message });
    }
};

/**
 * Mettre à jour le profil de l'utilisateur connecté
 */
const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, email, phone, address, bio, office, avatar_url } = req.body;

        // Vérifier que l'utilisateur existe
        const existingUser = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingUser) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Vérifier si l'email est déjà utilisé par un autre utilisateur
        if (email && email !== existingUser.email) {
            const emailExists = await prisma.user.findUnique({
                where: { email }
            });
            if (emailExists) {
                return res.status(400).json({ message: 'Cet email est déjà utilisé' });
            }
        }

        // Mettre à jour le profil
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                full_name: full_name || existingUser.full_name,
                email: email || existingUser.email,
                phone: phone !== undefined ? phone : existingUser.phone,
                address: address !== undefined ? address : existingUser.address,
                bio: bio !== undefined ? bio : existingUser.bio,
                office: office !== undefined ? office : existingUser.office,
                avatar_url: avatar_url !== undefined ? avatar_url : existingUser.avatar_url
            },
            select: {
                id: true,
                full_name: true,
                email: true,
                role: true,
                status: true,
                phone: true,
                address: true,
                bio: true,
                office: true,
                avatar_url: true,
                last_login: true,
                created_at: true
            }
        });

        res.json({
            message: 'Profil mis à jour avec succès',
            user: updatedUser
        });
    } catch (error) {
        console.error('Erreur mise à jour profil:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du profil', error: error.message });
    }
};

/**
 * Changer le mot de passe de l'utilisateur connecté
 */
const changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'L\'ancien et le nouveau mot de passe sont requis' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
        }

        // Récupérer l'utilisateur
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Vérifier l'ancien mot de passe
        const isMatch = await comparePassword(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
        }

        // Hasher le nouveau mot de passe
        const password_hash = await hashPassword(newPassword);

        // Mettre à jour le mot de passe
        await prisma.user.update({
            where: { id: parseInt(id) },
            data: { password_hash }
        });

        res.json({ message: 'Mot de passe changé avec succès' });
    } catch (error) {
        console.error('Erreur changement mot de passe:', error);
        res.status(500).json({ message: 'Erreur lors du changement de mot de passe', error: error.message });
    }
};

/**
 * Upload d'avatar pour l'utilisateur
 */
const uploadAvatar = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier fourni' });
        }

        // Récupérer l'utilisateur
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Supprimer l'ancien avatar s'il existe
        if (user.avatar_url) {
            const fs = require('fs');
            const path = require('path');
            const oldAvatarPath = path.join(__dirname, '..', user.avatar_url);

            if (fs.existsSync(oldAvatarPath)) {
                fs.unlinkSync(oldAvatarPath);
            }
        }

        // Construire l'URL de l'avatar
        const avatar_url = `/uploads/avatars/${req.file.filename}`;

        // Mettre à jour l'utilisateur avec la nouvelle URL d'avatar
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { avatar_url },
            select: {
                id: true,
                full_name: true,
                email: true,
                role: true,
                status: true,
                phone: true,
                address: true,
                bio: true,
                office: true,
                avatar_url: true,
                last_login: true,
                created_at: true
            }
        });

        res.json({
            message: 'Avatar uploadé avec succès',
            user: updatedUser
        });
    } catch (error) {
        console.error('Erreur upload avatar:', error);
        res.status(500).json({ message: 'Erreur lors de l\'upload de l\'avatar', error: error.message });
    }
};

module.exports = {
    register,
    login,
    getAllUsers,
    updateUser,
    deleteUser,
    updateUserStatus,
    resetPassword,
    updateProfile,
    changePassword,
    uploadAvatar
};
