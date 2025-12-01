const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Créer une nouvelle note
 */
const createGrade = async (req, res) => {
    try {
        const {
            enrollment_id,
            evaluation_name,
            value,
            max_value,
            weight,
            date,
            comments
        } = req.body;

        // Vérifier que l'inscription existe
        const enrollment = await prisma.enrollment.findUnique({
            where: { id: parseInt(enrollment_id) }
        });
        if (!enrollment) {
            return res.status(404).json({ message: 'Inscription non trouvée' });
        }

        const grade = await prisma.grade.create({
            data: {
                enrollment_id: parseInt(enrollment_id),
                evaluation_name,
                value: parseFloat(value),
                max_value: max_value ? parseFloat(max_value) : 20,
                weight: weight ? parseFloat(weight) : 1,
                date: date ? new Date(date) : new Date(),
                comments
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
            message: 'Note enregistrée avec succès',
            grade
        });
    } catch (error) {
        console.error('Erreur création note:', error);
        res.status(500).json({ message: 'Échec de l\'enregistrement de la note', error: error.message });
    }
};

/**
 * Obtenir toutes les notes avec filtres
 */
const getAllGrades = async (req, res) => {
    try {
        const { page = 1, limit = 10, enrollment_id, start_date, end_date } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (enrollment_id) where.enrollment_id = parseInt(enrollment_id);

        if (start_date && end_date) {
            where.date = {
                gte: new Date(start_date),
                lte: new Date(end_date)
            };
        }

        const [grades, total] = await Promise.all([
            prisma.grade.findMany({
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
            prisma.grade.count({ where })
        ]);

        res.json({
            grades,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Erreur récupération notes:', error);
        res.status(500).json({ message: 'Échec de la récupération des notes', error: error.message });
    }
};

/**
 * Obtenir une note par ID
 */
const getGradeById = async (req, res) => {
    try {
        const { id } = req.params;

        const grade = await prisma.grade.findUnique({
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

        if (!grade) {
            return res.status(404).json({ message: 'Note non trouvée' });
        }

        res.json({ grade });
    } catch (error) {
        console.error('Erreur récupération note:', error);
        res.status(500).json({ message: 'Échec de la récupération de la note', error: error.message });
    }
};

/**
 * Mettre à jour une note
 */
const updateGrade = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            evaluation_name,
            value,
            max_value,
            weight,
            date,
            comments
        } = req.body;

        const existing = await prisma.grade.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existing) {
            return res.status(404).json({ message: 'Note non trouvée' });
        }

        const grade = await prisma.grade.update({
            where: { id: parseInt(id) },
            data: {
                evaluation_name,
                value: value !== undefined ? parseFloat(value) : undefined,
                max_value: max_value !== undefined ? parseFloat(max_value) : undefined,
                weight: weight !== undefined ? parseFloat(weight) : undefined,
                date: date ? new Date(date) : undefined,
                comments
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
            message: 'Note mise à jour avec succès',
            grade
        });
    } catch (error) {
        console.error('Erreur mise à jour note:', error);
        res.status(500).json({ message: 'Échec de la mise à jour de la note', error: error.message });
    }
};

/**
 * Supprimer une note
 */
const deleteGrade = async (req, res) => {
    try {
        const { id } = req.params;

        const grade = await prisma.grade.findUnique({
            where: { id: parseInt(id) }
        });

        if (!grade) {
            return res.status(404).json({ message: 'Note non trouvée' });
        }

        await prisma.grade.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Note supprimée avec succès' });
    } catch (error) {
        console.error('Erreur suppression note:', error);
        res.status(500).json({ message: 'Échec de la suppression de la note', error: error.message });
    }
};

/**
 * Calculer la moyenne d'un étudiant pour une inscription
 */
const calculateEnrollmentAverage = async (req, res) => {
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
                grades: true
            }
        });

        if (!enrollment) {
            return res.status(404).json({ message: 'Inscription non trouvée' });
        }

        if (enrollment.grades.length === 0) {
            return res.json({
                student: enrollment.student,
                session: enrollment.session,
                average: null,
                message: 'Aucune note enregistrée'
            });
        }

        // Calculer la moyenne pondérée
        let totalWeightedScore = 0;
        let totalWeight = 0;

        enrollment.grades.forEach(grade => {
            const normalizedScore = (parseFloat(grade.value) / parseFloat(grade.max_value)) * 20; // Normaliser sur 20
            const weight = parseFloat(grade.weight);
            totalWeightedScore += normalizedScore * weight;
            totalWeight += weight;
        });

        const average = totalWeight > 0 ? (totalWeightedScore / totalWeight).toFixed(2) : 0;

        res.json({
            student: enrollment.student,
            session: enrollment.session,
            statistics: {
                totalGrades: enrollment.grades.length,
                average: parseFloat(average),
                grades: enrollment.grades.map(g => ({
                    evaluation: g.evaluation_name,
                    value: parseFloat(g.value),
                    max_value: parseFloat(g.max_value),
                    weight: parseFloat(g.weight),
                    date: g.date
                }))
            }
        });
    } catch (error) {
        console.error('Erreur calcul moyenne:', error);
        res.status(500).json({ message: 'Échec du calcul de la moyenne', error: error.message });
    }
};

/**
 * Obtenir le bulletin d'un étudiant
 */
const getStudentReport = async (req, res) => {
    try {
        const { enrollment_id } = req.params;

        const enrollment = await prisma.enrollment.findUnique({
            where: { id: parseInt(enrollment_id) },
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
                grades: {
                    orderBy: { date: 'asc' }
                },
                attendances: true
            }
        });

        if (!enrollment) {
            return res.status(404).json({ message: 'Inscription non trouvée' });
        }

        // Calculer la moyenne
        let average = null;
        if (enrollment.grades.length > 0) {
            let totalWeightedScore = 0;
            let totalWeight = 0;

            enrollment.grades.forEach(grade => {
                const normalizedScore = (parseFloat(grade.value) / parseFloat(grade.max_value)) * 20;
                const weight = parseFloat(grade.weight);
                totalWeightedScore += normalizedScore * weight;
                totalWeight += weight;
            });

            average = totalWeight > 0 ? (totalWeightedScore / totalWeight).toFixed(2) : 0;
        }

        // Calculer le taux de présence
        const totalAttendances = enrollment.attendances.length;
        const presentCount = enrollment.attendances.filter(a => a.status === 'présent').length;
        const attendanceRate = totalAttendances > 0 ? (presentCount / totalAttendances * 100).toFixed(2) : 0;

        res.json({
            student: enrollment.student,
            session: enrollment.session,
            report: {
                average: average ? parseFloat(average) : null,
                attendanceRate: `${attendanceRate}%`,
                totalGrades: enrollment.grades.length,
                totalAttendances,
                grades: enrollment.grades,
                status: enrollment.status
            }
        });
    } catch (error) {
        console.error('Erreur bulletin étudiant:', error);
        res.status(500).json({ message: 'Échec de la génération du bulletin', error: error.message });
    }
};

module.exports = {
    createGrade,
    getAllGrades,
    getGradeById,
    updateGrade,
    deleteGrade,
    calculateEnrollmentAverage,
    getStudentReport
};
