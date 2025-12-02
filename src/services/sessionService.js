import api from './api';

export const sessionService = {
    // Get all sessions
    async getAll() {
        const response = await api.get('/sessions');
        return response.data.sessions || response.data;
    },

    // Get session by ID
    async getById(id) {
        const response = await api.get(`/sessions/${id}`);
        return response.data.session || response.data;
    },

    // Create a new session
    async create(sessionData) {
        const response = await api.post('/sessions', sessionData);
        return response.data.session || response.data;
    },

    // Update a session
    async update(id, sessionData) {
        const response = await api.put(`/sessions/${id}`, sessionData);
        return response.data.session || response.data;
    },

    // Delete a session
    async delete(id) {
        const response = await api.delete(`/sessions/${id}`);
        return response.data;
    },

    // Get session statistics
    async getStats(id) {
        const response = await api.get(`/sessions/${id}/stats`);
        return response.data.statistics || response.data;
    }
};

export default sessionService;
