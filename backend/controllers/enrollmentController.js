const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Créer une nouvelle inscription
 */
const createEnrollment = async (req, res) => {
    try {
        const {
            student_id,
            session_id,
            total_amount,
            notes
        } = req.body;

        // Vérifier que l'étudiant existe
        const student = await prisma.student.findUnique({
            where: { id: parseInt(student_id) }
        });
        if (!student) {
            return res.status(404).json({ message: 'Étudiant non trouvé' });
        }

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

        // Vérifier la capacité de la session
        if (session.capacity && session.enrollments.length >= session.capacity) {
            return res.status(400).json({ message: 'La session a atteint sa capacité maximale' });
        }

        // Vérifier si l'étudiant n'est pas déjà inscrit
        const existingEnrollment = await prisma.enrollment.findFirst({
            where: {
                student_id: parseInt(student_id),
                session_id: parseInt(session_id)
            }
        });
        if (existingEnrollment) {
            return res.status(400).json({ message: 'L\'étudiant est déjà inscrit à cette session' });
        }

        const enrollment = await prisma.enrollment.create({
            data: {
                student_id: parseInt(student_id),
                session_id: parseInt(session_id),
                status: 'actif',
                total_amount: parseFloat(total_amount) || 0,
                paid_amount: 0,
                notes
            },
            include: {
                student: true,
                session: {
                    include: {
                        formation: true,
                        teacher: true
                    }
                }
            }
        });

        res.status(201).json({
            message: 'Inscription créée avec succès',
            enrollment
        });
    } catch (error) {
        console.error('Erreur création inscription:', error);
        res.status(500).json({ message: 'Échec de la création de l\'inscription', error: error.message });
    }
};

/**
 * Obtenir toutes les inscriptions avec filtres
 */
const getAllEnrollments = async (req, res) => {
    try {
        const { page = 1, limit = 10, student_id, session_id, status } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (student_id) where.student_id = parseInt(student_id);
        if (session_id) where.session_id = parseInt(session_id);
        if (status) where.status = status;

        const [enrollments, total] = await Promise.all([
            prisma.enrollment.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { created_at: 'desc' },
                include: {
                    student: true,
                    session: {
                        include: {
                            formation: true,
                            teacher: true
                        }
                    },
                    _count: {
                        select: {
                            attendances: true,
                            grades: true,
                            invoices: true
                        }
                    }
                }
            }),
            prisma.enrollment.count({ where })
        ]);

        res.json({
            enrollments,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Erreur récupération inscriptions:', error);
        res.status(500).json({ message: 'Échec de la récupération des inscriptions', error: error.message });
    }
};

/**
 * Obtenir une inscription par ID
 */
const getEnrollmentById = async (req, res) => {
    try {
        const { id } = req.params;

        const enrollment = await prisma.enrollment.findUnique({
            where: { id: parseInt(id) },
            include: {
                student: true,
                session: {
                    include: {
                        formation: {
                            include: {
                                modules: true
                            }
                        },
                        teacher: true
                    }
                },
                attendances: {
                    orderBy: { date: 'desc' }
                },
                grades: {
                    orderBy: { date: 'desc' }
                },
                invoices: {
                    include: {
                        payments: true
                    }
                }
            }
        });

        if (!enrollment) {
            return res.status(404).json({ message: 'Inscription non trouvée' });
        }

        res.json({ enrollment });
    } catch (error) {
        console.error('Erreur récupération inscription:', error);
        res.status(500).json({ message: 'Échec de la récupération de l\'inscription', error: error.message });
    }
};

/**
 * Mettre à jour une inscription
 */
const updateEnrollment = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            status,
            total_amount,
            paid_amount,
            notes
        } = req.body;

        const existing = await prisma.enrollment.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existing) {
            return res.status(404).json({ message: 'Inscription non trouvée' });
        }

        const enrollment = await prisma.enrollment.update({
            where: { id: parseInt(id) },
            data: {
                status,
                total_amount: total_amount !== undefined ? parseFloat(total_amount) : undefined,
                paid_amount: paid_amount !== undefined ? parseFloat(paid_amount) : undefined,
                notes
            },
            include: {
                student: true,
                session: {
                    include: {
                        formation: true
                    }
                }
            }
        });

        res.json({
            message: 'Inscription mise à jour avec succès',
            enrollment
        });
    } catch (error) {
        console.error('Erreur mise à jour inscription:', error);
        res.status(500).json({ message: 'Échec de la mise à jour de l\'inscription', error: error.message });
    }
};

/**
 * Supprimer une inscription
 */
const deleteEnrollment = async (req, res) => {
    try {
        const { id } = req.params;

        const enrollment = await prisma.enrollment.findUnique({
            where: { id: parseInt(id) }
        });

        if (!enrollment) {
            return res.status(404).json({ message: 'Inscription non trouvée' });
        }

        await prisma.enrollment.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Inscription supprimée avec succès' });
    } catch (error) {
        console.error('Erreur suppression inscription:', error);
        res.status(500).json({ message: 'Échec de la suppression de l\'inscription', error: error.message });
    }
};

/**
 * Obtenir le solde d'une inscription
 */
const getEnrollmentBalance = async (req, res) => {
    try {
        const { id } = req.params;

        const enrollment = await prisma.enrollment.findUnique({
            where: { id: parseInt(id) },
            include: {
                student: true,
                session: {
                    include: {
                        formation: true
                    }
                },
                invoices: {
                    include: {
                        payments: true
                    }
                }
            }
        });

        if (!enrollment) {
            return res.status(404).json({ message: 'Inscription non trouvée' });
        }

        const totalDue = parseFloat(enrollment.total_amount);
        const totalPaid = parseFloat(enrollment.paid_amount || 0);
        const balance = totalDue - totalPaid;

        res.json({
            enrollment: {
                id: enrollment.id,
                student: enrollment.student,
                session: enrollment.session
            },
            financial: {
                totalDue,
                totalPaid,
                balance,
                status: balance === 0 ? 'Payé' : balance < totalDue ? 'Partiellement payé' : 'Impayé'
            },
            invoices: enrollment.invoices
        });
    } catch (error) {
        console.error('Erreur solde inscription:', error);
        res.status(500).json({ message: 'Échec de la récupération du solde', error: error.message });
    }
};

module.exports = {
    createEnrollment,
    getAllEnrollments,
    getEnrollmentById,
    updateEnrollment,
    deleteEnrollment,
    getEnrollmentBalance
};
