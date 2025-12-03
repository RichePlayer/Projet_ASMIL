const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Créer un nouvel étudiant
 * Génère automatiquement un numéro d'inscription unique
 */
const createStudent = async (req, res) => {
    try {
        const {
            registration_number,
            first_name,
            last_name,
            date_of_birth,
            gender,
            email,
            phone_parent,
            address,
            photo_url
        } = req.body;

        // Vérifier si le numéro d'inscription existe déjà
        if (registration_number) {
            const existing = await prisma.student.findUnique({
                where: { registration_number }
            });
            if (existing) {
                return res.status(400).json({ message: 'Ce numéro d\'inscription existe déjà' });
            }
        }

        const student = await prisma.student.create({
            data: {
                registration_number,
                first_name,
                last_name,
                date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
                gender,
                email,
                phone_parent,
                address,
                address,
                photo_url,
                status: 'actif'
            }
        });

        res.status(201).json({
            message: 'Étudiant créé avec succès',
            student
        });
    } catch (error) {
        console.error('Erreur création étudiant:', error);
        res.status(500).json({ message: 'Échec de la création de l\'étudiant', error: error.message });
    }
};

/**
 * Obtenir tous les étudiants avec pagination et filtres
 */
const getAllStudents = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Construire les filtres
        const where = {};
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { first_name: { contains: search, mode: 'insensitive' } },
                { last_name: { contains: search, mode: 'insensitive' } },
                { registration_number: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [students, total] = await Promise.all([
            prisma.student.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { created_at: 'desc' },
                include: {
                    enrollments: {
                        include: {
                            session: {
                                include: {
                                    module: {
                                        include: {
                                            formation: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }),
            prisma.student.count({ where })
        ]);

        res.json({
            students,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Erreur récupération étudiants:', error);
        res.status(500).json({ message: 'Échec de la récupération des étudiants', error: error.message });
    }
};

/**
 * Obtenir un étudiant par ID avec toutes ses informations
 */
const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await prisma.student.findUnique({
            where: { id: parseInt(id) },
            include: {
                enrollments: {
                    include: {
                        session: {
                            include: {
                                formation: true,
                                teacher: true
                            }
                        },
                        attendances: true,
                        grades: true,
                        invoices: {
                            include: {
                                payments: true
                            }
                        }
                    }
                },
                certificates: {
                    include: {
                        formation: true
                    }
                }
            }
        });

        if (!student) {
            return res.status(404).json({ message: 'Étudiant non trouvé' });
        }

        res.json({ student });
    } catch (error) {
        console.error('Erreur récupération étudiant:', error);
        res.status(500).json({ message: 'Échec de la récupération de l\'étudiant', error: error.message });
    }
};

/**
 * Mettre à jour un étudiant
 */
const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            registration_number,
            first_name,
            last_name,
            date_of_birth,
            gender,
            email,
            phone_parent,
            address,
            status,
            photo_url
        } = req.body;

        // Vérifier si l'étudiant existe
        const existing = await prisma.student.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existing) {
            return res.status(404).json({ message: 'Étudiant non trouvé' });
        }

        // Vérifier l'unicité du numéro d'inscription si modifié
        if (registration_number && registration_number !== existing.registration_number) {
            const duplicate = await prisma.student.findUnique({
                where: { registration_number }
            });
            if (duplicate) {
                return res.status(400).json({ message: 'Ce numéro d\'inscription existe déjà' });
            }
        }

        const student = await prisma.student.update({
            where: { id: parseInt(id) },
            data: {
                registration_number,
                first_name,
                last_name,
                date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined,
                gender,
                email,
                phone_parent,
                address,
                status,
                photo_url
            }
        });

        res.json({
            message: 'Étudiant mis à jour avec succès',
            student
        });
    } catch (error) {
        console.error('Erreur mise à jour étudiant:', error);
        res.status(500).json({ message: 'Échec de la mise à jour de l\'étudiant', error: error.message });
    }
};

/**
 * Supprimer un étudiant
 * Supprime également toutes les inscriptions associées (cascade)
 */
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await prisma.student.findUnique({
            where: { id: parseInt(id) }
        });

        if (!student) {
            return res.status(404).json({ message: 'Étudiant non trouvé' });
        }

        await prisma.student.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Étudiant supprimé avec succès' });
    } catch (error) {
        console.error('Erreur suppression étudiant:', error);
        res.status(500).json({ message: 'Échec de la suppression de l\'étudiant', error: error.message });
    }
};

/**
 * Obtenir les statistiques d'un étudiant
 */
const getStudentStats = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await prisma.student.findUnique({
            where: { id: parseInt(id) },
            include: {
                enrollments: {
                    include: {
                        attendances: true,
                        grades: true,
                        invoices: {
                            include: {
                                payments: true
                            }
                        }
                    }
                }
            }
        });

        if (!student) {
            return res.status(404).json({ message: 'Étudiant non trouvé' });
        }

        // Calculer les statistiques
        const totalEnrollments = student.enrollments.length;
        const activeEnrollments = student.enrollments.filter(e => e.status === 'actif').length;

        let totalAttendances = 0;
        let presentCount = 0;
        student.enrollments.forEach(enrollment => {
            totalAttendances += enrollment.attendances.length;
            presentCount += enrollment.attendances.filter(a => a.status === 'présent').length;
        });
        const attendanceRate = totalAttendances > 0 ? (presentCount / totalAttendances * 100).toFixed(2) : 0;

        // Statistiques financières
        let totalDue = 0;
        let totalPaid = 0;
        student.enrollments.forEach(enrollment => {
            totalDue += parseFloat(enrollment.total_amount);
            totalPaid += parseFloat(enrollment.paid_amount || 0);
        });
        const balance = totalDue - totalPaid;

        res.json({
            statistics: {
                totalEnrollments,
                activeEnrollments,
                attendanceRate: `${attendanceRate}%`,
                financial: {
                    totalDue,
                    totalPaid,
                    balance
                }
            }
        });
    } catch (error) {
        console.error('Erreur statistiques étudiant:', error);
        res.status(500).json({ message: 'Échec de la récupération des statistiques', error: error.message });
    }
};

module.exports = {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getStudentStats
};
