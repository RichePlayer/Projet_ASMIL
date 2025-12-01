import React, { createContext, useContext, useState, useEffect } from "react";
import { logAction, LOG_ACTIONS } from "@/utils/auditLog";
import api from "@/services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check local storage for persisted session
        const storedUser = localStorage.getItem("asmil_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { user, token } = response.data;

            // Ajouter le token à l'objet utilisateur pour le stockage local
            const userWithToken = { ...user, token };

            setUser(userWithToken);
            localStorage.setItem("asmil_user", JSON.stringify(userWithToken));

            // Log successful login
            logAction(LOG_ACTIONS.LOGIN, { email }, userWithToken);

            return userWithToken;
        } catch (error) {
            // Log failed login attempt
            logAction(LOG_ACTIONS.LOGIN_FAILED, { email });
            throw new Error(error.response?.data?.message || "Identifiants incorrects");
        }
    };

    const logout = () => {
        // Log logout before clearing user
        if (user) {
            logAction(LOG_ACTIONS.LOGOUT, {}, user);
        }

        setUser(null);
        localStorage.removeItem("asmil_user");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
