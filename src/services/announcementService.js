import api from './api';

/**
 * Service pour gérer les annonces via l'API backend
 */
const announcementService = {
    /**
     * Récupérer toutes les annonces avec pagination et filtres
     * @param {Object} params - Paramètres de requête (page, limit, type, target_audience, published, active)
     */
    getAll: async (params = {}) => {
        const { page = 1, limit = 100, ...filters } = params;
        const response = await api.get('/announcements', {
            params: { page, limit, ...filters }
        });
        return response.data.announcements || [];
    },

    /**
     * Récupérer une annonce par ID
     * @param {number} id - ID de l'annonce
     */
    getById: async (id) => {
        const response = await api.get(`/announcements/${id}`);
        return response.data.announcement;
    },

    /**
     * Récupérer les annonces actives (publiées et non expirées)
     * @param {string} targetAudience - Public cible optionnel
     */
    getActive: async (targetAudience = null) => {
        const params = targetAudience ? { target_audience: targetAudience } : {};
        const response = await api.get('/announcements/active', { params });
        return response.data.announcements || [];
    },

    /**
     * Créer une nouvelle annonce
     * @param {Object} data - Données de l'annonce
     */
    create: async (data) => {
        const response = await api.post('/announcements', data);
        return response.data.announcement;
    },

    /**
     * Mettre à jour une annonce existante
     * @param {number} id - ID de l'annonce
     * @param {Object} data - Données à mettre à jour
     */
    update: async (id, data) => {
        const response = await api.put(`/announcements/${id}`, data);
        return response.data.announcement;
    },

    /**
     * Supprimer une annonce
     * @param {number} id - ID de l'annonce
     */
    delete: async (id) => {
        const response = await api.delete(`/announcements/${id}`);
        return response.data;
    },

    /**
     * Publier ou dépublier une annonce
     * @param {number} id - ID de l'annonce
     * @param {boolean} published - Statut de publication
     */
    togglePublish: async (id, published) => {
        const response = await api.put(`/announcements/${id}`, { published });
        return response.data.announcement;
    }
};

export default announcementService;
