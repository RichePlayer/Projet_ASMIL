const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Créer une nouvelle session
 */
const createSession = async (req, res) => {
    try {
        const {
            formation_id,
            teacher_id,
            start_date,
            end_date,
            room,
            capacity,
            schedule
        } = req.body;

        // Vérifier que la formation existe
        const formation = await prisma.formation.findUnique({
            where: { id: parseInt(formation_id) }
        });
        if (!formation) {
            return res.status(404).json({ message: 'Formation non trouvée' });
        }

        // Vérifier que l'enseignant existe si spécifié
        if (teacher_id) {
            const teacher = await prisma.teacher.findUnique({
                where: { id: parseInt(teacher_id) }
            });
            if (!teacher) {
                return res.status(404).json({ message: 'Enseignant non trouvé' });
            }
        }

        const session = await prisma.session.create({
            data: {
                formation_id: parseInt(formation_id),
                teacher_id: teacher_id ? parseInt(teacher_id) : null,
                start_date: new Date(start_date),
                end_date: new Date(end_date),
                room,
                capacity: capacity ? parseInt(capacity) : null,
                status: 'planifiée',
                schedule: schedule || null
            },
            include: {
                formation: true,
                teacher: true
            }
        });

        res.status(201).json({
            message: 'Session créée avec succès',
            session
        });
    } catch (error) {
        console.error('Erreur création session:', error);
        res.status(500).json({ message: 'Échec de la création de la session', error: error.message });
    }
};

/**
 * Obtenir toutes les sessions avec filtres
 */
const getAllSessions = async (req, res) => {
    try {
        const { page = 1, limit = 10, formation_id, teacher_id, status, start_date, end_date } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (formation_id) where.formation_id = parseInt(formation_id);
        if (teacher_id) where.teacher_id = parseInt(teacher_id);
        if (status) where.status = status;

        if (start_date && end_date) {
            where.AND = [
                { start_date: { gte: new Date(start_date) } },
                { end_date: { lte: new Date(end_date) } }
            ];
        }

        const [sessions, total] = await Promise.all([
            prisma.session.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { start_date: 'desc' },
                include: {
                    formation: true,
                    teacher: true,
                    _count: {
                        select: { enrollments: true }
                    }
                }
            }),
            prisma.session.count({ where })
        ]);

        res.json({
            sessions,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Erreur récupération sessions:', error);
        res.status(500).json({ message: 'Échec de la récupération des sessions', error: error.message });
    }
};

/**
 * Obtenir une session par ID avec détails complets
 */
const getSessionById = async (req, res) => {
    try {
        const { id } = req.params;

        const session = await prisma.session.findUnique({
            where: { id: parseInt(id) },
            include: {
                formation: {
                    include: {
                        modules: true
                    }
                },
                teacher: true,
                enrollments: {
                    include: {
                        student: true,
                        attendances: true,
                        grades: true
                    }
                }
            }
        });

        if (!session) {
            return res.status(404).json({ message: 'Session non trouvée' });
        }

        res.json({ session });
    } catch (error) {
        console.error('Erreur récupération session:', error);
        res.status(500).json({ message: 'Échec de la récupération de la session', error: error.message });
    }
};

/**
 * Mettre à jour une session
 */
const updateSession = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            formation_id,
            teacher_id,
            start_date,
            end_date,
            room,
            capacity,
            status,
            schedule
        } = req.body;

        const existing = await prisma.session.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existing) {
            return res.status(404).json({ message: 'Session non trouvée' });
        }

        const session = await prisma.session.update({
            where: { id: parseInt(id) },
            data: {
                formation_id: formation_id ? parseInt(formation_id) : undefined,
                teacher_id: teacher_id !== undefined ? (teacher_id ? parseInt(teacher_id) : null) : undefined,
                start_date: start_date ? new Date(start_date) : undefined,
                end_date: end_date ? new Date(end_date) : undefined,
                room,
                capacity: capacity !== undefined ? parseInt(capacity) : undefined,
                status,
                schedule: schedule !== undefined ? schedule : undefined
            },
            include: {
                formation: true,
                teacher: true
            }
        });

        res.json({
            message: 'Session mise à jour avec succès',
            session
        });
    } catch (error) {
        console.error('Erreur mise à jour session:', error);
        res.status(500).json({ message: 'Échec de la mise à jour de la session', error: error.message });
    }
};

/**
 * Supprimer une session
 */
const deleteSession = async (req, res) => {
    try {
        const { id } = req.params;

        const session = await prisma.session.findUnique({
            where: { id: parseInt(id) },
            include: {
                enrollments: true
            }
        });

        if (!session) {
            return res.status(404).json({ message: 'Session non trouvée' });
        }

        // Vérifier s'il y a des inscriptions
        if (session.enrollments.length > 0) {
            return res.status(400).json({
                message: 'Impossible de supprimer une session avec des inscriptions',
                enrollmentsCount: session.enrollments.length
            });
        }

        await prisma.session.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Session supprimée avec succès' });
    } catch (error) {
        console.error('Erreur suppression session:', error);
        res.status(500).json({ message: 'Échec de la suppression de la session', error: error.message });
    }
};

/**
 * Obtenir les statistiques d'une session
 */
const getSessionStats = async (req, res) => {
    try {
        const { id } = req.params;

        const session = await prisma.session.findUnique({
            where: { id: parseInt(id) },
            include: {
                enrollments: {
                    include: {
                        student: true,
                        attendances: true
                    }
                }
            }
        });

        if (!session) {
            return res.status(404).json({ message: 'Session non trouvée' });
        }

        const totalEnrolled = session.enrollments.length;
        const activeEnrollments = session.enrollments.filter(e => e.status === 'actif').length;
        const availableSpots = session.capacity ? session.capacity - totalEnrolled : null;

        // Calculer le taux de présence moyen
        let totalAttendances = 0;
        let presentCount = 0;
        session.enrollments.forEach(enrollment => {
            totalAttendances += enrollment.attendances.length;
            presentCount += enrollment.attendances.filter(a => a.status === 'présent').length;
        });
        const averageAttendanceRate = totalAttendances > 0 ? (presentCount / totalAttendances * 100).toFixed(2) : 0;

        res.json({
            statistics: {
                totalEnrolled,
                activeEnrollments,
                capacity: session.capacity,
                availableSpots,
                averageAttendanceRate: `${averageAttendanceRate}%`
            }
        });
    } catch (error) {
        console.error('Erreur statistiques session:', error);
        res.status(500).json({ message: 'Échec de la récupération des statistiques', error: error.message });
    }
};

module.exports = {
    createSession,
    getAllSessions,
    getSessionById,
    updateSession,
    deleteSession,
    getSessionStats
};
