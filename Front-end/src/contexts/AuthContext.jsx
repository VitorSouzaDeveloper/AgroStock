import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('agrostock_user');
        const token = localStorage.getItem('agrostock_token');
        
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
            api.defaults.headers.Authorization = `Bearer ${token}`;
        }
        
        setLoading(false); 
    }, []);

    // Função de Login simplificada: apenas guarda os dados que a página de Login enviou
    function login(loginData) { 
        setUser(loginData.user);
        
        // Injeta a chave na API
        api.defaults.headers.Authorization = `Bearer ${loginData.token}`;
        
        // Guarda no armazenamento local
        localStorage.setItem('agrostock_user', JSON.stringify(loginData.user));
        localStorage.setItem('agrostock_token', loginData.token);
    }

    function logout() {
        setUser(null);
        localStorage.removeItem('agrostock_user');
        localStorage.removeItem('agrostock_token');
        api.defaults.headers.Authorization = undefined;
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}