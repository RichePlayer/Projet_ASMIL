import api from './api';

export const certificateService = {
    // Get all certificates with pagination
    async getAll(params = {}) {
        const { page = 1, limit = 1000, status, student_id, formation_id } = params;
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(status && { status }),
            ...(student_id && { student_id: student_id.toString() }),
            ...(formation_id && { formation_id: formation_id.toString() })
        });
        const response = await api.get(`/certificates?${queryParams}`);
        return response.data.certificates;
    },

    // Get certificate by ID
    async getById(id) {
        const response = await api.get(`/certificates/${id}`);
        return response.data.certificate;
    },

    // Create a new certificate
    async create(certificateData) {
        const response = await api.post('/certificates', certificateData);
        return response.data.certificate;
    },

    // Update a certificate (status, etc.)
    async update(id, certificateData) {
        const response = await api.put(`/certificates/${id}`, certificateData);
        return response.data.certificate;
    },

    // Revoke a certificate
    async revoke(id) {
        const response = await api.put(`/certificates/${id}`, { status: 'révoqué' });
        return response.data.certificate;
    },

    // Delete a certificate
    async delete(id) {
        const response = await api.delete(`/certificates/${id}`);
        return response.data;
    },

    // Verify a certificate by number (public)
    async verify(certificateNumber) {
        const response = await api.get(`/certificates/verify/${certificateNumber}`);
        return response.data;
    }
};

export default certificateService;
