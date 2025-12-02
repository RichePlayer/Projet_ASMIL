const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Obtenir tous les modules avec les détails de la formation
 */
const getAllModules = async (req, res) => {
    try {
        const modules = await prisma.module.findMany({
            include: {
                formation: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });
        res.json(modules);
    } catch (error) {
        console.error('Erreur récupération modules:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des modules', error: error.message });
    }
};

/**
 * Créer un nouveau module
 */
const createModule = async (req, res) => {
    try {
        const { formation_id, title, description, hours, order_index } = req.body;

        if (!formation_id) {
            return res.status(400).json({ message: 'La formation est requise' });
        }

        const module = await prisma.module.create({
            data: {
                formation_id: parseInt(formation_id),
                title,
                description,
                hours: hours ? parseInt(hours) : null,
                order_index: order_index ? parseInt(order_index) : null
            },
            include: {
                formation: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });

        res.status(201).json(module);
    } catch (error) {
        console.error('Erreur création module:', error);
        res.status(500).json({ message: 'Erreur lors de la création du module', error: error.message });
    }
};

/**
 * Mettre à jour un module
 */
const updateModule = async (req, res) => {
    try {
        const { id } = req.params;
        const { formation_id, title, description, hours, order_index } = req.body;

        const module = await prisma.module.update({
            where: { id: parseInt(id) },
            data: {
                formation_id: formation_id ? parseInt(formation_id) : undefined,
                title,
                description,
                hours: hours ? parseInt(hours) : null,
                order_index: order_index ? parseInt(order_index) : null
            },
            include: {
                formation: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });

        res.json(module);
    } catch (error) {
        console.error('Erreur mise à jour module:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du module', error: error.message });
    }
};

/**
 * Supprimer un module
 */
const deleteModule = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.module.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Module supprimé avec succès' });
    } catch (error) {
        console.error('Erreur suppression module:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression du module', error: error.message });
    }
};

module.exports = {
    getAllModules,
    createModule,
    updateModule,
    deleteModule
};
