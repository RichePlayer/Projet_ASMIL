import api from './api';

const gradeService = {
    // Créer une nouvelle note
    createGrade: async (gradeData) => {
        const response = await api.post('/grades', gradeData);
        return response.data;
    },

    // Obtenir toutes les notes avec pagination et filtres
    getAllGrades: async (params = {}) => {
        const response = await api.get('/grades', { params });
        return response.data;
    },

    // Obtenir une note par ID
    getGradeById: async (id) => {
        const response = await api.get(`/grades/${id}`);
        return response.data;
    },

    // Mettre à jour une note
    updateGrade: async (id, gradeData) => {
        const response = await api.put(`/grades/${id}`, gradeData);
        return response.data;
    },

    // Supprimer une note
    deleteGrade: async (id) => {
        const response = await api.delete(`/grades/${id}`);
        return response.data;
    },

    // Calculer la moyenne d'un étudiant pour une inscription
    calculateEnrollmentAverage: async (enrollmentId) => {
        const response = await api.get(`/grades/enrollment/${enrollmentId}/average`);
        return response.data;
    },

    // Obtenir le bulletin d'un étudiant
    getStudentReport: async (enrollmentId) => {
        const response = await api.get(`/grades/enrollment/${enrollmentId}/report`);
        return response.data;
    },
};

export default gradeService;
