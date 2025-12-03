import api from './api';

export const enrollmentService = {
    // Get all enrollments with pagination
    async getAll(params = {}) {
        const { page = 1, limit = 1000, student_id, session_id, status } = params;
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(student_id && { student_id: student_id.toString() }),
            ...(session_id && { session_id: session_id.toString() }),
            ...(status && { status })
        });
        const response = await api.get(`/enrollments?${queryParams}`);
        return response.data.enrollments;
    },

    // Get enrollment by ID
    async getById(id) {
        const response = await api.get(`/enrollments/${id}`);
        return response.data.enrollment;
    },

    // Create a new enrollment
    async create(enrollmentData) {
        const response = await api.post('/enrollments', enrollmentData);
        return response.data.enrollment;
    },

    // Update an enrollment
    async update(id, enrollmentData) {
        const response = await api.put(`/enrollments/${id}`, enrollmentData);
        return response.data.enrollment;
    },

    // Delete an enrollment
    async delete(id) {
        const response = await api.delete(`/enrollments/${id}`);
        return response.data;
    },

    // Get enrollment balance
    async getBalance(id) {
        const response = await api.get(`/enrollments/${id}/balance`);
        return response.data;
    }
};

export default enrollmentService;
