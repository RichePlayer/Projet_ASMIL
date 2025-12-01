const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Enregistrer une présence
 */
const createAttendance = async (req, res) => {
    try {
        const {
            enrollment_id,
            date,
            status,
            notes
        } = req.body;

        // Vérifier que l'inscription existe
        const enrollment = await prisma.enrollment.findUnique({
            where: { id: parseInt(enrollment_id) }
        });
        if (!enrollment) {
            return res.status(404).json({ message: 'Inscription non trouvée' });
        }

        // Vérifier si une présence existe déjà pour cette date
        const existing = await prisma.attendance.findFirst({
            where: {
                enrollment_id: parseInt(enrollment_id),
                date: new Date(date)
            }
        });

        if (existing) {
            return res.status(400).json({ message: 'Une présence existe déjà pour cette date' });
        }

        const attendance = await prisma.attendance.create({
            data: {
                enrollment_id: parseInt(enrollment_id),
                date: new Date(date),
                status, // 'présent', 'absent', 'retard', 'excusé'
                notes
            },
            include: {
                enrollment: {
                    include: {
                        student: true,
                        session: {
                            include: {
                                formation: true
                            }
                        }
                    }
                }
            }
        });

        res.status(201).json({
            message: 'Présence enregistrée avec succès',
            attendance
        });
    } catch (error) {
        console.error('Erreur enregistrement présence:', error);
        res.status(500).json({ message: 'Échec de l\'enregistrement de la présence', error: error.message });
    }
};

/**
 * Obtenir toutes les présences avec filtres
 */
const getAllAttendances = async (req, res) => {
    try {
        const { page = 1, limit = 10, enrollment_id, status, start_date, end_date } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (enrollment_id) where.enrollment_id = parseInt(enrollment_id);
        if (status) where.status = status;

        if (start_date && end_date) {
            where.date = {
                gte: new Date(start_date),
                lte: new Date(end_date)
            };
        }

        const [attendances, total] = await Promise.all([
            prisma.attendance.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { date: 'desc' },
                include: {
                    enrollment: {
                        include: {
                            student: true,
                            session: {
                                include: {
                                    formation: true
                                }
                            }
                        }
                    }
                }
            }),
            prisma.attendance.count({ where })
        ]);

        res.json({
            attendances,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Erreur récupération présences:', error);
        res.status(500).json({ message: 'Échec de la récupération des présences', error: error.message });
    }
};

/**
 * Obtenir une présence par ID
 */
const getAttendanceById = async (req, res) => {
    try {
        const { id } = req.params;

        const attendance = await prisma.attendance.findUnique({
            where: { id: parseInt(id) },
            include: {
                enrollment: {
                    include: {
                        student: true,
                        session: {
                            include: {
                                formation: true,
                                teacher: true
                            }
                        }
                    }
                }
            }
        });

        if (!attendance) {
            return res.status(404).json({ message: 'Présence non trouvée' });
        }

        res.json({ attendance });
    } catch (error) {
        console.error('Erreur récupération présence:', error);
        res.status(500).json({ message: 'Échec de la récupération de la présence', error: error.message });
    }
};

/**
 * Mettre à jour une présence
 */
const updateAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const existing = await prisma.attendance.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existing) {
            return res.status(404).json({ message: 'Présence non trouvée' });
        }

        const attendance = await prisma.attendance.update({
            where: { id: parseInt(id) },
            data: {
                status,
                notes
            },
            include: {
                enrollment: {
                    include: {
                        student: true
                    }
                }
            }
        });

        res.json({
            message: 'Présence mise à jour avec succès',
            attendance
        });
    } catch (error) {
        console.error('Erreur mise à jour présence:', error);
        res.status(500).json({ message: 'Échec de la mise à jour de la présence', error: error.message });
    }
};

/**
 * Supprimer une présence
 */
const deleteAttendance = async (req, res) => {
    try {
        const { id } = req.params;

        const attendance = await prisma.attendance.findUnique({
            where: { id: parseInt(id) }
        });

        if (!attendance) {
            return res.status(404).json({ message: 'Présence non trouvée' });
        }

        await prisma.attendance.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Présence supprimée avec succès' });
    } catch (error) {
        console.error('Erreur suppression présence:', error);
        res.status(500).json({ message: 'Échec de la suppression de la présence', error: error.message });
    }
};

/**
 * Obtenir le taux de présence d'un étudiant
 */
const getStudentAttendanceRate = async (req, res) => {
    try {
        const { enrollment_id } = req.params;

        const enrollment = await prisma.enrollment.findUnique({
            where: { id: parseInt(enrollment_id) },
            include: {
                student: true,
                session: {
                    include: {
                        formation: true
                    }
                },
                attendances: true
            }
        });

        if (!enrollment) {
            return res.status(404).json({ message: 'Inscription non trouvée' });
        }

        const totalAttendances = enrollment.attendances.length;
        const presentCount = enrollment.attendances.filter(a => a.status === 'présent').length;
        const absentCount = enrollment.attendances.filter(a => a.status === 'absent').length;
        const lateCount = enrollment.attendances.filter(a => a.status === 'retard').length;
        const excusedCount = enrollment.attendances.filter(a => a.status === 'excusé').length;

        const attendanceRate = totalAttendances > 0 ? (presentCount / totalAttendances * 100).toFixed(2) : 0;

        res.json({
            student: enrollment.student,
            session: enrollment.session,
            statistics: {
                totalAttendances,
                present: presentCount,
                absent: absentCount,
                late: lateCount,
                excused: excusedCount,
                attendanceRate: `${attendanceRate}%`
            }
        });
    } catch (error) {
        console.error('Erreur taux de présence:', error);
        res.status(500).json({ message: 'Échec du calcul du taux de présence', error: error.message });
    }
};

/**
 * Enregistrer les présences pour une session à une date donnée
 */
const bulkCreateAttendances = async (req, res) => {
    try {
        const { session_id, date, attendances } = req.body;

        // Vérifier que la session existe
        const session = await prisma.session.findUnique({
            where: { id: parseInt(session_id) },
            include: {
                enrollments: true
            }
        });

        if (!session) {
            return res.status(404).json({ message: 'Session non trouvée' });
        }

        // Créer les présences en masse
        const createdAttendances = [];
        for (const att of attendances) {
            // Vérifier si l'inscription appartient à cette session
            const enrollment = session.enrollments.find(e => e.id === parseInt(att.enrollment_id));
            if (!enrollment) {
                continue; // Ignorer les inscriptions invalides
            }

            // Vérifier si une présence existe déjà
            const existing = await prisma.attendance.findFirst({
                where: {
                    enrollment_id: parseInt(att.enrollment_id),
                    date: new Date(date)
                }
            });

            if (!existing) {
                const attendance = await prisma.attendance.create({
                    data: {
                        enrollment_id: parseInt(att.enrollment_id),
                        date: new Date(date),
                        status: att.status,
                        notes: att.notes
                    }
                });
                createdAttendances.push(attendance);
            }
        }

        res.status(201).json({
            message: `${createdAttendances.length} présences enregistrées avec succès`,
            attendances: createdAttendances
        });
    } catch (error) {
        console.error('Erreur enregistrement présences en masse:', error);
        res.status(500).json({ message: 'Échec de l\'enregistrement des présences', error: error.message });
    }
};

module.exports = {
    createAttendance,
    getAllAttendances,
    getAttendanceById,
    updateAttendance,
    deleteAttendance,
    getStudentAttendanceRate,
    bulkCreateAttendances
};
