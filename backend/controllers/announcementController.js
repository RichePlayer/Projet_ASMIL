const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Créer une nouvelle annonce
 */
const createAnnouncement = async (req, res) => {
    try {
        const {
            title,
            content,
            type,
            target_audience,
            published,
            publish_date,
            expiry_date
        } = req.body;

        const announcement = await prisma.announcement.create({
            data: {
                title,
                content,
                type: type || 'information', // 'information', 'urgence', 'événement'
                target_audience: target_audience || 'tous', // 'tous', 'étudiants', 'enseignants'
                published: published !== undefined ? published : true,
                publish_date: publish_date ? new Date(publish_date) : new Date(),
                expiry_date: expiry_date ? new Date(expiry_date) : null
            }
        });

        res.status(201).json({
            message: 'Annonce créée avec succès',
            announcement
        });
    } catch (error) {
        console.error('Erreur création annonce:', error);
        res.status(500).json({ message: 'Échec de la création de l\'annonce', error: error.message });
    }
};

/**
 * Obtenir toutes les annonces avec filtres
 */
const getAllAnnouncements = async (req, res) => {
    try {
        const { page = 1, limit = 10, type, target_audience, published, active } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (type) where.type = type;
        if (target_audience) where.target_audience = target_audience;
        if (published !== undefined) where.published = published === 'true';

        // Filtrer les annonces actives (non expirées)
        if (active === 'true') {
            where.AND = [
                { published: true },
                {
                    OR: [
                        { expiry_date: null },
                        { expiry_date: { gte: new Date() } }
                    ]
                }
            ];
        }

        const [announcements, total] = await Promise.all([
            prisma.announcement.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { publish_date: 'desc' }
            }),
            prisma.announcement.count({ where })
        ]);

        res.json({
            announcements,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Erreur récupération annonces:', error);
        res.status(500).json({ message: 'Échec de la récupération des annonces', error: error.message });
    }
};

/**
 * Obtenir une annonce par ID
 */
const getAnnouncementById = async (req, res) => {
    try {
        const { id } = req.params;

        const announcement = await prisma.announcement.findUnique({
            where: { id: parseInt(id) }
        });

        if (!announcement) {
            return res.status(404).json({ message: 'Annonce non trouvée' });
        }

        res.json({ announcement });
    } catch (error) {
        console.error('Erreur récupération annonce:', error);
        res.status(500).json({ message: 'Échec de la récupération de l\'annonce', error: error.message });
    }
};

/**
 * Mettre à jour une annonce
 */
const updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            content,
            type,
            target_audience,
            published,
            publish_date,
            expiry_date
        } = req.body;

        const existing = await prisma.announcement.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existing) {
            return res.status(404).json({ message: 'Annonce non trouvée' });
        }

        const announcement = await prisma.announcement.update({
            where: { id: parseInt(id) },
            data: {
                title,
                content,
                type,
                target_audience,
                published: published !== undefined ? published : undefined,
                publish_date: publish_date ? new Date(publish_date) : undefined,
                expiry_date: expiry_date !== undefined ? (expiry_date ? new Date(expiry_date) : null) : undefined
            }
        });

        res.json({
            message: 'Annonce mise à jour avec succès',
            announcement
        });
    } catch (error) {
        console.error('Erreur mise à jour annonce:', error);
        res.status(500).json({ message: 'Échec de la mise à jour de l\'annonce', error: error.message });
    }
};

/**
 * Supprimer une annonce
 */
const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;

        const announcement = await prisma.announcement.findUnique({
            where: { id: parseInt(id) }
        });

        if (!announcement) {
            return res.status(404).json({ message: 'Annonce non trouvée' });
        }

        await prisma.announcement.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Annonce supprimée avec succès' });
    } catch (error) {
        console.error('Erreur suppression annonce:', error);
        res.status(500).json({ message: 'Échec de la suppression de l\'annonce', error: error.message });
    }
};

/**
 * Obtenir les annonces actives (non expirées et publiées)
 */
const getActiveAnnouncements = async (req, res) => {
    try {
        const { target_audience } = req.query;

        const where = {
            published: true,
            OR: [
                { expiry_date: null },
                { expiry_date: { gte: new Date() } }
            ]
        };

        if (target_audience) {
            where.target_audience = { in: [target_audience, 'tous'] };
        }

        const announcements = await prisma.announcement.findMany({
            where,
            orderBy: { publish_date: 'desc' }
        });

        res.json({ announcements, count: announcements.length });
    } catch (error) {
        console.error('Erreur annonces actives:', error);
        res.status(500).json({ message: 'Échec de la récupération des annonces actives', error: error.message });
    }
};

module.exports = {
    createAnnouncement,
    getAllAnnouncements,
    getAnnouncementById,
    updateAnnouncement,
    deleteAnnouncement,
    getActiveAnnouncements
};
