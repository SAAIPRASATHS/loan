import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('[AUTH CONTEXT] Initializing, checking sessionStorage');
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
        console.log('[AUTH CONTEXT] User from sessionStorage:', userInfo);
        if (userInfo) {
            setUser(userInfo);
            console.log('[AUTH CONTEXT] User loaded:', userInfo.email, 'Role:', userInfo.role);
        } else {
            console.log('[AUTH CONTEXT] No user in sessionStorage');
        }
        setLoading(false);
        console.log('[AUTH CONTEXT] Initialization complete');
    }, []);

    const login = (userData) => {
        console.log('[AUTH CONTEXT] Login called with:', userData);
        sessionStorage.setItem('userInfo', JSON.stringify(userData));
        setUser(userData);
        console.log('[AUTH CONTEXT] User logged in:', userData.email, 'Role:', userData.role);
    };

    const logout = () => {
        console.log('[AUTH CONTEXT] Logout called');
        sessionStorage.removeItem('userInfo');
        setUser(null);
        console.log('[AUTH CONTEXT] User logged out');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
