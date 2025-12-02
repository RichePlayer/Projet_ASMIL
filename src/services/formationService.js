import api from './api';

export const formationService = {
    // Get all formations
    async getAll() {
        const response = await api.get('/formations');
        return response.data.formations || response.data;
    },

    // Get formation by ID
    async getById(id) {
        const response = await api.get(`/formations/${id}`);
        return response.data.formation || response.data;
    },

    // Create a new formation
    async create(formationData) {
        const response = await api.post('/formations', formationData);
        return response.data.formation || response.data;
    },

    // Update a formation
    async update(id, formationData) {
        const response = await api.put(`/formations/${id}`, formationData);
        return response.data.formation || response.data;
    },

    // Delete a formation
    async delete(id) {
        const response = await api.delete(`/formations/${id}`);
        return response.data;
    }
};

export default formationService;
