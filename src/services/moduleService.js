import api from './api';

export const moduleService = {
    // Get all modules
    async getAll() {
        const response = await api.get('/modules');
        return response.data;
    },

    // Create a new module
    async create(moduleData) {
        const response = await api.post('/modules', moduleData);
        return response.data;
    },

    // Update a module
    async update(id, moduleData) {
        const response = await api.put(`/modules/${id}`, moduleData);
        return response.data;
    },

    // Delete a module
    async delete(id) {
        const response = await api.delete(`/modules/${id}`);
        return response.data;
    }
};

export default moduleService;
