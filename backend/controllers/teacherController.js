const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Créer un nouvel enseignant
 */
const createTeacher = async (req, res) => {
    try {
        const {
            registration_number,
            first_name,
            last_name,
            email,
            phone,
            photo_url,
            specialties,
            bio,
            hire_date,
            hourly_rate,
            availability
        } = req.body;

        // Vérifier si le numéro d'inscription existe déjà
        if (registration_number) {
            const existing = await prisma.teacher.findUnique({
                where: { registration_number }
            });
            if (existing) {
                return res.status(400).json({ message: 'Ce numéro d\'inscription existe déjà' });
            }
        }

        // Vérifier l'unicité de l'email
        if (email) {
            const existingEmail = await prisma.teacher.findUnique({
                where: { email }
            });
            if (existingEmail) {
                return res.status(400).json({ message: 'Cet email est déjà utilisé' });
            }
        }

        const teacher = await prisma.teacher.create({
            data: {
                registration_number,
                first_name,
                last_name,
                email,
                phone,
                photo_url,
                specialties: specialties || [],
                bio,
                status: 'actif',
                hire_date: hire_date ? new Date(hire_date) : null,
                hourly_rate: hourly_rate ? parseFloat(hourly_rate) : null,
                availability: availability || []
            }
        });

        res.status(201).json({
            message: 'Enseignant créé avec succès',
            teacher
        });
    } catch (error) {
        console.error('Erreur création enseignant:', error);
        res.status(500).json({ message: 'Échec de la création de l\'enseignant', error: error.message });
    }
};

/**
 * Obtenir tous les enseignants avec filtres
 */
const getAllTeachers = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, specialty, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (status) where.status = status;
        if (specialty) {
            where.specialties = {
                has: specialty
            };
        }
        if (search) {
            where.OR = [
                { first_name: { contains: search, mode: 'insensitive' } },
                { last_name: { contains: search, mode: 'insensitive' } },
                { registration_number: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [teachers, total] = await Promise.all([
            prisma.teacher.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { created_at: 'desc' },
                include: {
                    _count: {
                        select: { sessions: true }
                    }
                }
            }),
            prisma.teacher.count({ where })
        ]);

        res.json({
            teachers,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Erreur récupération enseignants:', error);
        res.status(500).json({ message: 'Échec de la récupération des enseignants', error: error.message });
    }
};

/**
 * Obtenir un enseignant par ID avec ses sessions
 */
const getTeacherById = async (req, res) => {
    try {
        const { id } = req.params;

        const teacher = await prisma.teacher.findUnique({
            where: { id: parseInt(id) },
            include: {
                sessions: {
                    include: {
                        formation: true,
                        _count: {
                            select: { enrollments: true }
                        }
                    },
                    orderBy: { start_date: 'desc' }
                }
            }
        });

        if (!teacher) {
            return res.status(404).json({ message: 'Enseignant non trouvé' });
        }

        res.json({ teacher });
    } catch (error) {
        console.error('Erreur récupération enseignant:', error);
        res.status(500).json({ message: 'Échec de la récupération de l\'enseignant', error: error.message });
    }
};

/**
 * Mettre à jour un enseignant
 */
const updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            registration_number,
            first_name,
            last_name,
            email,
            phone,
            photo_url,
            specialties,
            bio,
            status,
            hire_date,
            hourly_rate,
            availability
        } = req.body;

        const existing = await prisma.teacher.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existing) {
            return res.status(404).json({ message: 'Enseignant non trouvé' });
        }

        // Vérifier l'unicité du numéro d'inscription si modifié
        if (registration_number && registration_number !== existing.registration_number) {
            const duplicate = await prisma.teacher.findUnique({
                where: { registration_number }
            });
            if (duplicate) {
                return res.status(400).json({ message: 'Ce numéro d\'inscription existe déjà' });
            }
        }

        // Vérifier l'unicité de l'email si modifié
        if (email && email !== existing.email) {
            const duplicateEmail = await prisma.teacher.findUnique({
                where: { email }
            });
            if (duplicateEmail) {
                return res.status(400).json({ message: 'Cet email est déjà utilisé' });
            }
        }

        const teacher = await prisma.teacher.update({
            where: { id: parseInt(id) },
            data: {
                registration_number,
                first_name,
                last_name,
                email,
                phone,
                photo_url,
                specialties,
                bio,
                status,
                hire_date: hire_date ? new Date(hire_date) : undefined,
                hourly_rate: hourly_rate !== undefined ? parseFloat(hourly_rate) : undefined,
                availability
            }
        });

        res.json({
            message: 'Enseignant mis à jour avec succès',
            teacher
        });
    } catch (error) {
        console.error('Erreur mise à jour enseignant:', error);
        res.status(500).json({ message: 'Échec de la mise à jour de l\'enseignant', error: error.message });
    }
};

/**
 * Supprimer un enseignant
 */
const deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;

        const teacher = await prisma.teacher.findUnique({
            where: { id: parseInt(id) },
            include: {
                sessions: true
            }
        });

        if (!teacher) {
            return res.status(404).json({ message: 'Enseignant non trouvé' });
        }

        // Vérifier s'il a des sessions actives
        const activeSessions = teacher.sessions.filter(s => s.status === 'planifiée' || s.status === 'en cours');
        if (activeSessions.length > 0) {
            return res.status(400).json({
                message: 'Impossible de supprimer un enseignant avec des sessions actives',
                activeSessions: activeSessions.length
            });
        }

        await prisma.teacher.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Enseignant supprimé avec succès' });
    } catch (error) {
        console.error('Erreur suppression enseignant:', error);
        res.status(500).json({ message: 'Échec de la suppression de l\'enseignant', error: error.message });
    }
};

/**
 * Obtenir les statistiques d'un enseignant
 */
const getTeacherStats = async (req, res) => {
    try {
        const { id } = req.params;

        const teacher = await prisma.teacher.findUnique({
            where: { id: parseInt(id) },
            include: {
                sessions: {
                    include: {
                        formation: true,
                        enrollments: true
                    }
                }
            }
        });

        if (!teacher) {
            return res.status(404).json({ message: 'Enseignant non trouvé' });
        }

        // Calculer les statistiques
        const totalSessions = teacher.sessions.length;
        const activeSessions = teacher.sessions.filter(s => s.status === 'planifiée' || s.status === 'en cours').length;
        const completedSessions = teacher.sessions.filter(s => s.status === 'terminée').length;

        let totalStudents = 0;
        teacher.sessions.forEach(session => {
            totalStudents += session.enrollments.length;
        });

        // Calculer les heures enseignées (estimation basée sur les sessions terminées)
        const estimatedHours = completedSessions * 40; // Estimation moyenne

        res.json({
            statistics: {
                totalSessions,
                activeSessions,
                completedSessions,
                totalStudents,
                estimatedHours,
                hourlyRate: teacher.hourly_rate
            }
        });
    } catch (error) {
        console.error('Erreur statistiques enseignant:', error);
        res.status(500).json({ message: 'Échec de la récupération des statistiques', error: error.message });
    }
};

/**
 * Obtenir la disponibilité d'un enseignant
 */
const getTeacherAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { start_date, end_date } = req.query;

        const teacher = await prisma.teacher.findUnique({
            where: { id: parseInt(id) }
        });

        if (!teacher) {
            return res.status(404).json({ message: 'Enseignant non trouvé' });
        }

        const where = {
            teacher_id: parseInt(id),
            status: { in: ['planifiée', 'en cours'] }
        };

        if (start_date && end_date) {
            where.AND = [
                { start_date: { gte: new Date(start_date) } },
                { end_date: { lte: new Date(end_date) } }
            ];
        }

        const sessions = await prisma.session.findMany({
            where,
            include: {
                formation: true
            },
            orderBy: { start_date: 'asc' }
        });

        res.json({
            teacher: {
                id: teacher.id,
                name: `${teacher.first_name} ${teacher.last_name}`,
                status: teacher.status
            },
            sessions
        });
    } catch (error) {
        console.error('Erreur disponibilité enseignant:', error);
        res.status(500).json({ message: 'Échec de la récupération de la disponibilité', error: error.message });
    }
};

module.exports = {
    createTeacher,
    getAllTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher,
    getTeacherStats,
    getTeacherAvailability
};
