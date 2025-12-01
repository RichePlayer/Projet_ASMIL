const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Créer un nouveau paiement
 * Met automatiquement à jour le statut de la facture et de l'inscription
 */
const createPayment = async (req, res) => {
    try {
        const {
            invoice_id,
            amount,
            method,
            transaction_reference,
            payment_date,
            notes
        } = req.body;

        // Vérifier que la facture existe
        const invoice = await prisma.invoice.findUnique({
            where: { id: parseInt(invoice_id) },
            include: {
                payments: true,
                enrollment: true
            }
        });

        if (!invoice) {
            return res.status(404).json({ message: 'Facture non trouvée' });
        }

        const paymentAmount = parseFloat(amount);
        const invoiceAmount = parseFloat(invoice.amount);

        // Calculer le total déjà payé
        const totalPaid = invoice.payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const newTotalPaid = totalPaid + paymentAmount;

        // Vérifier que le paiement ne dépasse pas le montant de la facture
        if (newTotalPaid > invoiceAmount) {
            return res.status(400).json({
                message: 'Le montant du paiement dépasse le solde restant',
                remaining: invoiceAmount - totalPaid
            });
        }

        // Créer le paiement
        const payment = await prisma.payment.create({
            data: {
                invoice_id: parseInt(invoice_id),
                amount: paymentAmount,
                method,
                transaction_reference,
                payment_date: payment_date ? new Date(payment_date) : new Date(),
                notes
            }
        });

        // Déterminer le nouveau statut de la facture
        let newInvoiceStatus = 'impayée';
        if (newTotalPaid >= invoiceAmount) {
            newInvoiceStatus = 'payée';
        } else if (newTotalPaid > 0) {
            newInvoiceStatus = 'partiellement payée';
        }

        // Mettre à jour le statut de la facture
        await prisma.invoice.update({
            where: { id: parseInt(invoice_id) },
            data: { status: newInvoiceStatus }
        });

        // Mettre à jour le montant payé de l'inscription
        await prisma.enrollment.update({
            where: { id: invoice.enrollment_id },
            data: {
                paid_amount: {
                    increment: paymentAmount
                }
            }
        });

        res.status(201).json({
            message: 'Paiement enregistré avec succès',
            payment,
            invoiceStatus: newInvoiceStatus,
            totalPaid: newTotalPaid,
            balance: invoiceAmount - newTotalPaid
        });
    } catch (error) {
        console.error('Erreur création paiement:', error);
        res.status(500).json({ message: 'Échec de l\'enregistrement du paiement', error: error.message });
    }
};

/**
 * Obtenir tous les paiements avec filtres
 */
const getAllPayments = async (req, res) => {
    try {
        const { page = 1, limit = 10, invoice_id, method, start_date, end_date } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (invoice_id) where.invoice_id = parseInt(invoice_id);
        if (method) where.method = method;

        if (start_date && end_date) {
            where.payment_date = {
                gte: new Date(start_date),
                lte: new Date(end_date)
            };
        }

        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { payment_date: 'desc' },
                include: {
                    invoice: {
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
                    }
                }
            }),
            prisma.payment.count({ where })
        ]);

        res.json({
            payments,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Erreur récupération paiements:', error);
        res.status(500).json({ message: 'Échec de la récupération des paiements', error: error.message });
    }
};

/**
 * Obtenir un paiement par ID
 */
const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;

        const payment = await prisma.payment.findUnique({
            where: { id: parseInt(id) },
            include: {
                invoice: {
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
                }
            }
        });

        if (!payment) {
            return res.status(404).json({ message: 'Paiement non trouvé' });
        }

        res.json({ payment });
    } catch (error) {
        console.error('Erreur récupération paiement:', error);
        res.status(500).json({ message: 'Échec de la récupération du paiement', error: error.message });
    }
};

/**
 * Mettre à jour un paiement
 */
const updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            amount,
            method,
            transaction_reference,
            payment_date,
            notes
        } = req.body;

        const existing = await prisma.payment.findUnique({
            where: { id: parseInt(id) },
            include: {
                invoice: {
                    include: {
                        payments: true
                    }
                }
            }
        });

        if (!existing) {
            return res.status(404).json({ message: 'Paiement non trouvé' });
        }

        // Si le montant change, recalculer le statut de la facture
        let shouldUpdateInvoice = false;
        if (amount && parseFloat(amount) !== parseFloat(existing.amount)) {
            shouldUpdateInvoice = true;
        }

        const payment = await prisma.payment.update({
            where: { id: parseInt(id) },
            data: {
                amount: amount !== undefined ? parseFloat(amount) : undefined,
                method,
                transaction_reference,
                payment_date: payment_date ? new Date(payment_date) : undefined,
                notes
            }
        });

        // Recalculer le statut de la facture si nécessaire
        if (shouldUpdateInvoice) {
            const invoice = existing.invoice;
            const totalPaid = invoice.payments.reduce((sum, p) => {
                if (p.id === parseInt(id)) {
                    return sum + parseFloat(amount);
                }
                return sum + parseFloat(p.amount);
            }, 0);

            const invoiceAmount = parseFloat(invoice.amount);
            let newStatus = 'impayée';
            if (totalPaid >= invoiceAmount) {
                newStatus = 'payée';
            } else if (totalPaid > 0) {
                newStatus = 'partiellement payée';
            }

            await prisma.invoice.update({
                where: { id: invoice.id },
                data: { status: newStatus }
            });
        }

        res.json({
            message: 'Paiement mis à jour avec succès',
            payment
        });
    } catch (error) {
        console.error('Erreur mise à jour paiement:', error);
        res.status(500).json({ message: 'Échec de la mise à jour du paiement', error: error.message });
    }
};

/**
 * Supprimer un paiement
 * Met à jour le statut de la facture et de l'inscription
 */
const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;

        const payment = await prisma.payment.findUnique({
            where: { id: parseInt(id) },
            include: {
                invoice: {
                    include: {
                        payments: true,
                        enrollment: true
                    }
                }
            }
        });

        if (!payment) {
            return res.status(404).json({ message: 'Paiement non trouvé' });
        }

        const paymentAmount = parseFloat(payment.amount);

        // Supprimer le paiement
        await prisma.payment.delete({
            where: { id: parseInt(id) }
        });

        // Recalculer le total payé sans ce paiement
        const totalPaid = payment.invoice.payments
            .filter(p => p.id !== parseInt(id))
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);

        const invoiceAmount = parseFloat(payment.invoice.amount);
        let newStatus = 'impayée';
        if (totalPaid >= invoiceAmount) {
            newStatus = 'payée';
        } else if (totalPaid > 0) {
            newStatus = 'partiellement payée';
        }

        // Mettre à jour le statut de la facture
        await prisma.invoice.update({
            where: { id: payment.invoice_id },
            data: { status: newStatus }
        });

        // Mettre à jour le montant payé de l'inscription
        await prisma.enrollment.update({
            where: { id: payment.invoice.enrollment_id },
            data: {
                paid_amount: {
                    decrement: paymentAmount
                }
            }
        });

        res.json({ message: 'Paiement supprimé avec succès' });
    } catch (error) {
        console.error('Erreur suppression paiement:', error);
        res.status(500).json({ message: 'Échec de la suppression du paiement', error: error.message });
    }
};

/**
 * Obtenir les statistiques de paiements
 */
const getPaymentStats = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        const where = {};
        if (start_date && end_date) {
            where.payment_date = {
                gte: new Date(start_date),
                lte: new Date(end_date)
            };
        }

        const payments = await prisma.payment.findMany({ where });

        const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const paymentsByMethod = {};

        payments.forEach(p => {
            const method = p.method || 'Non spécifié';
            if (!paymentsByMethod[method]) {
                paymentsByMethod[method] = { count: 0, total: 0 };
            }
            paymentsByMethod[method].count++;
            paymentsByMethod[method].total += parseFloat(p.amount);
        });

        res.json({
            statistics: {
                totalPayments: payments.length,
                totalAmount,
                byMethod: paymentsByMethod
            }
        });
    } catch (error) {
        console.error('Erreur statistiques paiements:', error);
        res.status(500).json({ message: 'Échec de la récupération des statistiques', error: error.message });
    }
};

module.exports = {
    createPayment,
    getAllPayments,
    getPaymentById,
    updatePayment,
    deletePayment,
    getPaymentStats
};
