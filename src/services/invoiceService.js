import api from './api';

export const invoiceService = {
    // Obtenir toutes les factures
    async getAll(params = {}) {
        const queryParams = new URLSearchParams(params);
        const response = await api.get(`/invoices?${queryParams}`);
        return response.data.invoices;
    },

    // Obtenir une facture par ID
    async getById(id) {
        const response = await api.get(`/invoices/${id}`);
        return response.data.invoice;
    },

    // Créer une nouvelle facture
    async create(invoiceData) {
        const response = await api.post('/invoices', invoiceData);
        return response.data;
    },

    // Mettre à jour une facture
    async update(id, invoiceData) {
        const response = await api.put(`/invoices/${id}`, invoiceData);
        return response.data.invoice;
    },

    // Supprimer une facture
    async delete(id) {
        const response = await api.delete(`/invoices/${id}`);
        return response.data;
    },

    // Obtenir les factures en retard
    async getOverdue() {
        const response = await api.get('/invoices/overdue');
        return response.data.invoices;
    },

    // Obtenir les statistiques financières
    async getStats(params = {}) {
        const queryParams = new URLSearchParams(params);
        const response = await api.get(`/invoices/stats?${queryParams}`);
        return response.data.statistics;
    }
};

export default invoiceService;
