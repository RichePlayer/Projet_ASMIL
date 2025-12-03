import api from './api';

export const paymentService = {
    // Obtenir tous les paiements
    async getAll(params = {}) {
        const queryParams = new URLSearchParams(params);
        const response = await api.get(`/payments?${queryParams}`);
        return response.data.payments;
    },

    // Obtenir un paiement par ID
    async getById(id) {
        const response = await api.get(`/payments/${id}`);
        return response.data.payment;
    },

    // Créer un nouveau paiement
    async create(paymentData) {
        const response = await api.post('/payments', paymentData);
        return response.data;
    },

    // Mettre à jour un paiement
    async update(id, paymentData) {
        const response = await api.put(`/payments/${id}`, paymentData);
        return response.data.payment;
    },

    // Supprimer un paiement
    async delete(id) {
        const response = await api.delete(`/payments/${id}`);
        return response.data;
    },

    // Obtenir les statistiques de paiement
    async getStats(params = {}) {
        const queryParams = new URLSearchParams(params);
        const response = await api.get(`/payments/stats?${queryParams}`);
        return response.data.statistics;
    }
};

export default paymentService;
