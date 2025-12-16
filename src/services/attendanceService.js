import api from './api';

export const attendanceService = {
    /**
     * Récupérer toutes les présences avec pagination et filtres
     * @param {Object} params - Paramètres de filtre
     * @param {number} params.page - Numéro de page
     * @param {number} params.limit - Limite par page
     * @param {number} params.enrollment_id - ID de l'inscription
     * @param {string} params.status - Statut (présent, absent, retard, excusé)
     * @param {string} params.start_date - Date de début
     * @param {string} params.end_date - Date de fin
     */
    async getAll(params = {}) {
        const { page = 1, limit = 1000, enrollment_id, status, start_date, end_date } = params;
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(enrollment_id && { enrollment_id: enrollment_id.toString() }),
            ...(status && { status }),
            ...(start_date && { start_date }),
            ...(end_date && { end_date })
        });
        const response = await api.get(`/attendances?${queryParams}`);
        return response.data.attendances || [];
    },

    /**
     * Récupérer une présence par ID
     */
    async getById(id) {
        const response = await api.get(`/attendances/${id}`);
        return response.data.attendance;
    },

    /**
     * Créer une nouvelle présence
     * @param {Object} data - Données de la présence
     * @param {number} data.enrollment_id - ID de l'inscription
     * @param {string} data.date - Date (format YYYY-MM-DD)
     * @param {string} data.status - Statut (présent, absent, retard, excusé)
     * @param {string} data.notes - Notes optionnelles
     */
    async create(data) {
        const response = await api.post('/attendances', data);
        return response.data.attendance;
    },

    /**
     * Mettre à jour une présence
     * @param {number} id - ID de la présence
     * @param {Object} data - Données à mettre à jour
     */
    async update(id, data) {
        const response = await api.put(`/attendances/${id}`, data);
        return response.data.attendance;
    },

    /**
     * Supprimer une présence
     */
    async delete(id) {
        const response = await api.delete(`/attendances/${id}`);
        return response.data;
    },

    /**
     * Enregistrer les présences en masse pour une session
     * @param {number} sessionId - ID de la session
     * @param {string} date - Date (format YYYY-MM-DD)
     * @param {Array} attendances - Liste des présences [{enrollment_id, status, notes}]
     */
    async bulkCreate(sessionId, date, attendances) {
        const response = await api.post('/attendances/bulk', {
            session_id: sessionId,
            date,
            attendances
        });
        return response.data;
    },

    /**
     * Obtenir le taux de présence d'un étudiant pour une inscription
     * @param {number} enrollmentId - ID de l'inscription
     */
    async getStudentRate(enrollmentId) {
        const response = await api.get(`/attendances/enrollment/${enrollmentId}/rate`);
        return response.data;
    },

    /**
     * Obtenir les présences d'une session
     * @param {number} sessionId - ID de la session
     * @param {string} date - Date optionnelle (format YYYY-MM-DD)
     */
    async getBySession(sessionId, date = null) {
        const queryParams = date ? `?date=${date}` : '';
        const response = await api.get(`/attendances/session/${sessionId}${queryParams}`);
        return response.data;
    },

    /**
     * Obtenir les statistiques globales de présence
     * @param {string} startDate - Date de début optionnelle
     * @param {string} endDate - Date de fin optionnelle
     */
    async getStats(startDate = null, endDate = null) {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        const queryString = params.toString() ? `?${params.toString()}` : '';
        const response = await api.get(`/attendances/stats/global${queryString}`);
        return response.data;
    }
};

export default attendanceService;
