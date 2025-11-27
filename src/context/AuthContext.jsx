import React, { createContext, useContext, useState, useEffect } from "react";
import { logAction, LOG_ACTIONS } from "@/utils/auditLog";

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
        // Mock authentication logic
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email === "admin@asmil.mg" && password === "admin123") {
                    const adminUser = {
                        id: 1,
                        full_name: "Administrateur",
                        email: "admin@asmil.mg",
                        role: "Admin",
                        avatar: "",
                        phone: "+261 34 00 000 00",
                        address: "Antananarivo, Madagascar",
                        office: "Bureau Direction",
                        bio: "Administrateur système responsable de la maintenance et de la sécurité de la plateforme ASMiL."
                    };
                    setUser(adminUser);
                    localStorage.setItem("asmil_user", JSON.stringify(adminUser));

                    // Log successful login
                    logAction(LOG_ACTIONS.LOGIN, { email }, adminUser);

                    resolve(adminUser);
                } else if (email === "secretaire@asmil.mg" && password === "password") {
                    const normalUser = {
                        id: 2,
                        full_name: "Secrétaire Principale",
                        email: "secretaire@asmil.mg",
                        role: "Gestionnaire",
                        avatar: "",
                        phone: "+261 33 11 222 33",
                        address: "Antananarivo, Madagascar",
                        office: "Bureau A-102",
                        bio: "Responsable de la gestion administrative et des inscriptions."
                    };
                    setUser(normalUser);
                    localStorage.setItem("asmil_user", JSON.stringify(normalUser));

                    // Log successful login
                    logAction(LOG_ACTIONS.LOGIN, { email }, normalUser);

                    resolve(normalUser);
                } else {
                    // Log failed login attempt
                    logAction(LOG_ACTIONS.LOGIN_FAILED, { email });
                    reject(new Error("Identifiants incorrects"));
                }
            }, 1000);
        });
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
