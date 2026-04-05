import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        if (!localStorage.getItem('token')) return;
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    };

    const markNotificationAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (err) {
            console.error('Failed to mark notification as read', err);
        }
    };

    const clearAllNotifications = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications([]);
        } catch (err) {
            console.error('Failed to clear all notifications', err);
        }
    };

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/auth/profile');
                    setUser(res.data);
                } catch (error) {
                    console.error('Initial auth check failed', error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
            return () => clearInterval(interval);
        }
    }, [user]);

    const login = async (credentials) => {
        const res = await api.post('/auth/login', credentials);
        localStorage.setItem('token', res.data.token);
        setUser(res.data);
    };

    const register = async (userData) => {
        const res = await api.post('/auth/register', userData);
        localStorage.setItem('token', res.data.token);
        setUser(res.data);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const updateWallet = async (walletAddress) => {
        try {
            const res = await api.put('/auth/profile', { walletAddress });
            setUser(res.data);
            return res.data;
        } catch (err) {
            console.error('Failed to update wallet address', err);
            throw err;
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            notifications, 
            loading, 
            login, 
            register, 
            logout, 
            updateWallet,
            fetchNotifications, 
            markNotificationAsRead,
            clearAllNotifications 
        }}>
            {children}
        </AuthContext.Provider>
    );
};
