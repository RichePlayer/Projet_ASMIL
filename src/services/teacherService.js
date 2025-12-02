import api from './api';

export const teacherService = {
    // Get all teachers
    async getAll() {
        const response = await api.get('/teachers');
        return response.data.teachers || response.data;
    },

    // Get teacher by ID
    async getById(id) {
        const response = await api.get(`/teachers/${id}`);
        return response.data.teacher || response.data;
    },

    // Create a new teacher
    async create(teacherData) {
        const response = await api.post('/teachers', teacherData);
        return response.data.teacher || response.data;
    },

    // Update a teacher
    async update(id, teacherData) {
        const response = await api.put(`/teachers/${id}`, teacherData);
        return response.data.teacher || response.data;
    },

    // Delete a teacher
    async delete(id) {
        const response = await api.delete(`/teachers/${id}`);
        return response.data;
    }
};

export default teacherService;
