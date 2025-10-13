import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    // Efeito para carregar dados do usuário do localStorage ao iniciar
    useEffect(() => {
        const storedUser = localStorage.getItem('agrostock_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Função de Login: Salva os dados no estado e no localStorage
    function login(userData) {
        setUser(userData);
        localStorage.setItem('agrostock_user', JSON.stringify(userData));
    }

    // Função de Logout: Limpa os dados
    function logout() {
        setUser(null);
        localStorage.removeItem('agrostock_user');
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}