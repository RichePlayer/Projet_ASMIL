const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Générer un numéro de certificat unique
 */
const generateCertificateNumber = async () => {
    const year = new Date().getFullYear();
    const count = await prisma.certificate.count();
    const number = String(count + 1).padStart(5, '0');
    return `CERT-${year}-${number}`;
};

/**
 * Créer un nouveau certificat
 */
const createCertificate = async (req, res) => {
    try {
        const {
            student_id,
            formation_id,
            date_obtention
        } = req.body;

        // Vérifier que l'étudiant existe
        const student = await prisma.student.findUnique({
            where: { id: parseInt(student_id) }
        });
        if (!student) {
            return res.status(404).json({ message: 'Étudiant non trouvé' });
        }

        // Vérifier que la formation existe
        const formation = await prisma.formation.findUnique({
            where: { id: parseInt(formation_id) }
        });
        if (!formation) {
            return res.status(404).json({ message: 'Formation non trouvée' });
        }

        // Vérifier si un certificat existe déjà pour cet étudiant et cette formation
        const existing = await prisma.certificate.findFirst({
            where: {
                student_id: parseInt(student_id),
                formation_id: parseInt(formation_id)
            }
        });

        if (existing) {
            return res.status(400).json({ message: 'Un certificat existe déjà pour cet étudiant et cette formation' });
        }

        // Générer un numéro de certificat unique
        const certificate_number = await generateCertificateNumber();

        const certificate = await prisma.certificate.create({
            data: {
                certificate_number,
                student_id: parseInt(student_id),
                formation_id: parseInt(formation_id),
                date_obtention: date_obtention ? new Date(date_obtention) : new Date(),
                status: 'valide'
            },
            include: {
                student: true,
                formation: true
            }
        });

        res.status(201).json({
            message: 'Certificat généré avec succès',
            certificate
        });
    } catch (error) {
        console.error('Erreur création certificat:', error);
        res.status(500).json({ message: 'Échec de la génération du certificat', error: error.message });
    }
};

/**
 * Obtenir tous les certificats avec filtres
 */
const getAllCertificates = async (req, res) => {
    try {
        const { page = 1, limit = 10, student_id, formation_id, status } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (student_id) where.student_id = parseInt(student_id);
        if (formation_id) where.formation_id = parseInt(formation_id);
        if (status) where.status = status;

        const [certificates, total] = await Promise.all([
            prisma.certificate.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { date_obtention: 'desc' },
                include: {
                    student: true,
                    formation: true
                }
            }),
            prisma.certificate.count({ where })
        ]);

        res.json({
            certificates,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Erreur récupération certificats:', error);
        res.status(500).json({ message: 'Échec de la récupération des certificats', error: error.message });
    }
};

/**
 * Obtenir un certificat par ID
 */
const getCertificateById = async (req, res) => {
    try {
        const { id } = req.params;

        const certificate = await prisma.certificate.findUnique({
            where: { id: parseInt(id) },
            include: {
                student: true,
                formation: {
                    include: {
                        modules: true
                    }
                }
            }
        });

        if (!certificate) {
            return res.status(404).json({ message: 'Certificat non trouvé' });
        }

        res.json({ certificate });
    } catch (error) {
        console.error('Erreur récupération certificat:', error);
        res.status(500).json({ message: 'Échec de la récupération du certificat', error: error.message });
    }
};

/**
 * Vérifier l'authenticité d'un certificat par son numéro
 */
const verifyCertificate = async (req, res) => {
    try {
        const { certificate_number } = req.params;

        const certificate = await prisma.certificate.findUnique({
            where: { certificate_number },
            include: {
                student: true,
                formation: true
            }
        });

        if (!certificate) {
            return res.status(404).json({
                valid: false,
                message: 'Certificat non trouvé'
            });
        }

        res.json({
            valid: certificate.status === 'valide',
            certificate: {
                certificate_number: certificate.certificate_number,
                student: {
                    first_name: certificate.student.first_name,
                    last_name: certificate.student.last_name
                },
                formation: {
                    title: certificate.formation.title
                },
                date_obtention: certificate.date_obtention,
                status: certificate.status
            }
        });
    } catch (error) {
        console.error('Erreur vérification certificat:', error);
        res.status(500).json({ message: 'Échec de la vérification du certificat', error: error.message });
    }
};

/**
 * Mettre à jour un certificat
 */
const updateCertificate = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, date_obtention } = req.body;

        const existing = await prisma.certificate.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existing) {
            return res.status(404).json({ message: 'Certificat non trouvé' });
        }

        const certificate = await prisma.certificate.update({
            where: { id: parseInt(id) },
            data: {
                status,
                date_obtention: date_obtention ? new Date(date_obtention) : undefined
            },
            include: {
                student: true,
                formation: true
            }
        });

        res.json({
            message: 'Certificat mis à jour avec succès',
            certificate
        });
    } catch (error) {
        console.error('Erreur mise à jour certificat:', error);
        res.status(500).json({ message: 'Échec de la mise à jour du certificat', error: error.message });
    }
};

/**
 * Supprimer un certificat
 */
const deleteCertificate = async (req, res) => {
    try {
        const { id } = req.params;

        const certificate = await prisma.certificate.findUnique({
            where: { id: parseInt(id) }
        });

        if (!certificate) {
            return res.status(404).json({ message: 'Certificat non trouvé' });
        }

        await prisma.certificate.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Certificat supprimé avec succès' });
    } catch (error) {
        console.error('Erreur suppression certificat:', error);
        res.status(500).json({ message: 'Échec de la suppression du certificat', error: error.message });
    }
};

module.exports = {
    createCertificate,
    getAllCertificates,
    getCertificateById,
    verifyCertificate,
    updateCertificate,
    deleteCertificate
};
