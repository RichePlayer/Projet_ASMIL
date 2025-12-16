import api from './api';

export const userService = {
    /**
     * Mettre à jour le profil utilisateur
     */
    async updateProfile(userId, data) {
        const response = await api.put(`/auth/profile/${userId}`, data);
        return response.data;
    },

    /**
     * Changer le mot de passe
     */
    async changePassword(userId, currentPassword, newPassword) {
        const response = await api.put(`/auth/change-password/${userId}`, {
            currentPassword,
            newPassword
        });
        return response.data;
    },

    /**
     * Obtenir les informations de l'utilisateur connecté
     */
    async getMe() {
        const response = await api.get('/auth/me');
        return response.data.user;
    },

    /**
     * Upload d'avatar
     */
    async uploadAvatar(userId, file) {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await api.post(`/auth/upload-avatar/${userId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
};

export default userService;
