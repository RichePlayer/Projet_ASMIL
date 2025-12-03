const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Créer une nouvelle facture
 */
const createInvoice = async (req, res) => {
    try {
        const {
            invoice_number,
            enrollment_id,
            amount,
            due_date,
            notes
        } = req.body;

        // Vérifier que l'inscription existe
        const enrollment = await prisma.enrollment.findUnique({
            where: { id: parseInt(enrollment_id) }
        });
        if (!enrollment) {
            return res.status(404).json({ message: 'Inscription non trouvée' });
        }

        // Vérifier l'unicité du numéro de facture
        if (invoice_number) {
            const existing = await prisma.invoice.findUnique({
                where: { invoice_number }
            });
            if (existing) {
                return res.status(400).json({ message: 'Ce numéro de facture existe déjà' });
            }
        }

        const invoice = await prisma.invoice.create({
            data: {
                invoice_number,
                enrollment_id: parseInt(enrollment_id),
                amount: parseFloat(amount),
                due_date: due_date ? new Date(due_date) : null,
                status: 'impayée',
                notes
            },
            include: {
                enrollment: {
                    include: {
                        student: true,
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
        });

        res.status(201).json({
            message: 'Facture créée avec succès',
            invoice
        });
    } catch (error) {
        console.error('Erreur création facture:', error);
        res.status(500).json({ message: 'Échec de la création de la facture', error: error.message });
    }
};

/**
 * Obtenir toutes les factures avec filtres
 */
const getAllInvoices = async (req, res) => {
    try {
        const { page = 1, limit = 10, enrollment_id, status, overdue } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (enrollment_id) where.enrollment_id = parseInt(enrollment_id);
        if (status) where.status = status;

        // Filtrer les factures en retard
        if (overdue === 'true') {
            where.AND = [
                { status: { not: 'payée' } },
                { due_date: { lt: new Date() } }
            ];
        }

        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { created_at: 'desc' },
                include: {
                    enrollment: {
                        include: {
                            student: true,
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
                    },
                    payments: true
                }
            }),
            prisma.invoice.count({ where })
        ]);

        res.json({
            invoices,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Erreur récupération factures:', error);
        res.status(500).json({ message: 'Échec de la récupération des factures', error: error.message });
    }
};

/**
 * Obtenir une facture par ID
 */
const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;

        const invoice = await prisma.invoice.findUnique({
            where: { id: parseInt(id) },
            include: {
                enrollment: {
                    include: {
                        student: true,
                        session: {
                            include: {
                                module: {
                                    include: {
                                        formation: true
                                    }
                                },
                                teacher: true
                            }
                        }
                    }
                },
                payments: {
                    orderBy: { payment_date: 'desc' }
                }
            }
        });

        if (!invoice) {
            return res.status(404).json({ message: 'Facture non trouvée' });
        }

        // Calculer le total payé
        const totalPaid = invoice.payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
        const balance = parseFloat(invoice.amount) - totalPaid;

        res.json({
            invoice: {
                ...invoice,
                totalPaid,
                balance
            }
        });
    } catch (error) {
        console.error('Erreur récupération facture:', error);
        res.status(500).json({ message: 'Échec de la récupération de la facture', error: error.message });
    }
};

/**
 * Mettre à jour une facture
 */
const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            invoice_number,
            amount,
            due_date,
            status,
            notes
        } = req.body;

        const existing = await prisma.invoice.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existing) {
            return res.status(404).json({ message: 'Facture non trouvée' });
        }

        // Vérifier l'unicité du numéro de facture si modifié
        if (invoice_number && invoice_number !== existing.invoice_number) {
            const duplicate = await prisma.invoice.findUnique({
                where: { invoice_number }
            });
            if (duplicate) {
                return res.status(400).json({ message: 'Ce numéro de facture existe déjà' });
            }
        }

        const invoice = await prisma.invoice.update({
            where: { id: parseInt(id) },
            data: {
                invoice_number,
                amount: amount !== undefined ? parseFloat(amount) : undefined,
                due_date: due_date ? new Date(due_date) : undefined,
                status,
                notes
            },
            include: {
                enrollment: {
                    include: {
                        student: true
                    }
                },
                payments: true
            }
        });

        res.json({
            message: 'Facture mise à jour avec succès',
            invoice
        });
    } catch (error) {
        console.error('Erreur mise à jour facture:', error);
        res.status(500).json({ message: 'Échec de la mise à jour de la facture', error: error.message });
    }
};

/**
 * Supprimer une facture
 */
const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;

        const invoice = await prisma.invoice.findUnique({
            where: { id: parseInt(id) },
            include: {
                payments: true
            }
        });

        if (!invoice) {
            return res.status(404).json({ message: 'Facture non trouvée' });
        }

        // Vérifier s'il y a des paiements
        if (invoice.payments.length > 0) {
            return res.status(400).json({
                message: 'Impossible de supprimer une facture avec des paiements',
                paymentsCount: invoice.payments.length
            });
        }

        await prisma.invoice.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Facture supprimée avec succès' });
    } catch (error) {
        console.error('Erreur suppression facture:', error);
        res.status(500).json({ message: 'Échec de la suppression de la facture', error: error.message });
    }
};

/**
 * Obtenir les factures en retard
 */
const getOverdueInvoices = async (req, res) => {
    try {
        const invoices = await prisma.invoice.findMany({
            where: {
                status: { not: 'payée' },
                due_date: { lt: new Date() }
            },
            include: {
                enrollment: {
                    include: {
                        student: true,
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
                },
                payments: true
            },
            orderBy: { due_date: 'asc' }
        });

        res.json({ invoices, count: invoices.length });
    } catch (error) {
        console.error('Erreur factures en retard:', error);
        res.status(500).json({ message: 'Échec de la récupération des factures en retard', error: error.message });
    }
};

/**
 * Obtenir les statistiques financières
 */
const getFinancialStats = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        const where = {};
        if (start_date && end_date) {
            where.created_at = {
                gte: new Date(start_date),
                lte: new Date(end_date)
            };
        }

        const invoices = await prisma.invoice.findMany({
            where,
            include: {
                payments: true
            }
        });

        const totalInvoiced = invoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
        const totalPaid = invoices.reduce((sum, inv) => {
            const paid = inv.payments.reduce((pSum, payment) => pSum + parseFloat(payment.amount), 0);
            return sum + paid;
        }, 0);
        const totalOutstanding = totalInvoiced - totalPaid;

        const paidInvoices = invoices.filter(inv => inv.status === 'payée').length;
        const unpaidInvoices = invoices.filter(inv => inv.status === 'impayée').length;
        const partiallyPaid = invoices.filter(inv => inv.status === 'partiellement payée').length;

        res.json({
            statistics: {
                totalInvoiced,
                totalPaid,
                totalOutstanding,
                invoiceCount: {
                    total: invoices.length,
                    paid: paidInvoices,
                    unpaid: unpaidInvoices,
                    partiallyPaid
                }
            }
        });
    } catch (error) {
        console.error('Erreur statistiques financières:', error);
        res.status(500).json({ message: 'Échec de la récupération des statistiques', error: error.message });
    }
};

module.exports = {
    createInvoice,
    getAllInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,
    getOverdueInvoices,
    getFinancialStats
};
