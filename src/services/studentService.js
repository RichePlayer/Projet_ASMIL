import api from './api';

export const studentService = {
    // Get all students with pagination
    async getAll(params = {}) {
        const { page = 1, limit = 1000, status, search } = params;
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(status && { status }),
            ...(search && { search })
        });
        const response = await api.get(`/students?${queryParams}`);
        return response.data.students;
    },

    // Get student by ID
    async getById(id) {
        const response = await api.get(`/students/${id}`);
        return response.data.student;
    },

    // Create a new student
    async create(studentData) {
        const response = await api.post('/students', studentData);
        return response.data.student;
    },

    // Update a student
    async update(id, studentData) {
        const response = await api.put(`/students/${id}`, studentData);
        return response.data.student;
    },

    // Delete a student
    async delete(id) {
        const response = await api.delete(`/students/${id}`);
        return response.data;
    },

    // Get student statistics
    async getStats(id) {
        const response = await api.get(`/students/${id}/stats`);
        return response.data.statistics;
    }
};

export default studentService;
