const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Créer une nouvelle formation
 */
const createFormation = async (req, res) => {
    try {
        const {
            category_id,
            title,
            description,
            duration_months,
            price,
            type,
            image_url,
            prerequisites
        } = req.body;

        const formation = await prisma.formation.create({
            data: {
                category_id: category_id ? parseInt(category_id) : null,
                title,
                description,
                duration_months: duration_months ? parseInt(duration_months) : null,
                price: parseFloat(price) || 0,
                type,
                image_url,
                prerequisites
            },
            include: {
                category: true
            }
        });

        res.status(201).json({
            message: 'Formation créée avec succès',
            formation
        });
    } catch (error) {
        console.error('Erreur création formation:', error);
        res.status(500).json({ message: 'Échec de la création de la formation', error: error.message });
    }
};

/**
 * Obtenir toutes les formations avec filtres
 */
const getAllFormations = async (req, res) => {
    try {
        const { page = 1, limit = 10, category_id, type, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (category_id) where.category_id = parseInt(category_id);
        if (type) where.type = type;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [formations, total] = await Promise.all([
            prisma.formation.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { created_at: 'desc' },
                include: {
                    category: true,
                    modules: {
                        orderBy: { order_index: 'asc' }
                    },
                    _count: {
                        select: {
                            sessions: true,
                            certificates: true
                        }
                    }
                }
            }),
            prisma.formation.count({ where })
        ]);

        res.json({
            formations,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Erreur récupération formations:', error);
        res.status(500).json({ message: 'Échec de la récupération des formations', error: error.message });
    }
};

/**
 * Obtenir une formation par ID avec tous ses détails
 */
const getFormationById = async (req, res) => {
    try {
        const { id } = req.params;

        const formation = await prisma.formation.findUnique({
            where: { id: parseInt(id) },
            include: {
                category: true,
                modules: {
                    orderBy: { order_index: 'asc' }
                },
                sessions: {
                    include: {
                        teacher: true,
                        _count: {
                            select: { enrollments: true }
                        }
                    },
                    orderBy: { start_date: 'desc' }
                },
                certificates: {
                    include: {
                        student: true
                    }
                }
            }
        });

        if (!formation) {
            return res.status(404).json({ message: 'Formation non trouvée' });
        }

        res.json({ formation });
    } catch (error) {
        console.error('Erreur récupération formation:', error);
        res.status(500).json({ message: 'Échec de la récupération de la formation', error: error.message });
    }
};

/**
 * Mettre à jour une formation
 */
const updateFormation = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            category_id,
            title,
            description,
            duration_months,
            price,
            type,
            image_url,
            prerequisites
        } = req.body;

        const existing = await prisma.formation.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existing) {
            return res.status(404).json({ message: 'Formation non trouvée' });
        }

        const formation = await prisma.formation.update({
            where: { id: parseInt(id) },
            data: {
                category_id: category_id !== undefined ? (category_id ? parseInt(category_id) : null) : undefined,
                title,
                description,
                duration_months: duration_months !== undefined ? parseInt(duration_months) : undefined,
                price: price !== undefined ? parseFloat(price) : undefined,
                type,
                image_url,
                prerequisites
            },
            include: {
                category: true,
                modules: true
            }
        });

        res.json({
            message: 'Formation mise à jour avec succès',
            formation
        });
    } catch (error) {
        console.error('Erreur mise à jour formation:', error);
        res.status(500).json({ message: 'Échec de la mise à jour de la formation', error: error.message });
    }
};

/**
 * Supprimer une formation
 */
const deleteFormation = async (req, res) => {
    try {
        const { id } = req.params;

        const formation = await prisma.formation.findUnique({
            where: { id: parseInt(id) }
        });

        if (!formation) {
            return res.status(404).json({ message: 'Formation non trouvée' });
        }

        await prisma.formation.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Formation supprimée avec succès' });
    } catch (error) {
        console.error('Erreur suppression formation:', error);
        res.status(500).json({ message: 'Échec de la suppression de la formation', error: error.message });
    }
};

/**
 * Ajouter un module à une formation
 */
const addModule = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, hours, order_index } = req.body;

        const formation = await prisma.formation.findUnique({
            where: { id: parseInt(id) }
        });

        if (!formation) {
            return res.status(404).json({ message: 'Formation non trouvée' });
        }

        const module = await prisma.module.create({
            data: {
                formation_id: parseInt(id),
                title,
                description,
                hours: hours ? parseInt(hours) : null,
                order_index: order_index ? parseInt(order_index) : null
            }
        });

        res.status(201).json({
            message: 'Module ajouté avec succès',
            module
        });
    } catch (error) {
        console.error('Erreur ajout module:', error);
        res.status(500).json({ message: 'Échec de l\'ajout du module', error: error.message });
    }
};

/**
 * Mettre à jour un module
 */
const updateModule = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const { title, description, hours, order_index } = req.body;

        const existing = await prisma.module.findUnique({
            where: { id: parseInt(moduleId) }
        });

        if (!existing) {
            return res.status(404).json({ message: 'Module non trouvé' });
        }

        const module = await prisma.module.update({
            where: { id: parseInt(moduleId) },
            data: {
                title,
                description,
                hours: hours !== undefined ? parseInt(hours) : undefined,
                order_index: order_index !== undefined ? parseInt(order_index) : undefined
            }
        });

        res.json({
            message: 'Module mis à jour avec succès',
            module
        });
    } catch (error) {
        console.error('Erreur mise à jour module:', error);
        res.status(500).json({ message: 'Échec de la mise à jour du module', error: error.message });
    }
};

/**
 * Supprimer un module
 */
const deleteModule = async (req, res) => {
    try {
        const { moduleId } = req.params;

        const module = await prisma.module.findUnique({
            where: { id: parseInt(moduleId) }
        });

        if (!module) {
            return res.status(404).json({ message: 'Module non trouvé' });
        }

        await prisma.module.delete({
            where: { id: parseInt(moduleId) }
        });

        res.json({ message: 'Module supprimé avec succès' });
    } catch (error) {
        console.error('Erreur suppression module:', error);
        res.status(500).json({ message: 'Échec de la suppression du module', error: error.message });
    }
};

/**
 * Obtenir toutes les catégories
 */
const getAllCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { formations: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        res.json({ categories });
    } catch (error) {
        console.error('Erreur récupération catégories:', error);
        res.status(500).json({ message: 'Échec de la récupération des catégories', error: error.message });
    }
};

/**
 * Créer une catégorie
 */
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        const category = await prisma.category.create({
            data: { name }
        });

        res.status(201).json({
            message: 'Catégorie créée avec succès',
            category
        });
    } catch (error) {
        console.error('Erreur création catégorie:', error);
        res.status(500).json({ message: 'Échec de la création de la catégorie', error: error.message });
    }
};

module.exports = {
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
};
