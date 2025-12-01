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

module.exports = {
    register,
    login,
    getAllUsers,
    updateUser,
    deleteUser,
    updateUserStatus,
    resetPassword
};
