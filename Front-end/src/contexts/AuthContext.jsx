import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    // Efeito para carregar dados do usuário do localStorage ao iniciar
    useEffect(() => {
        const storedUser = localStorage.getItem('agrostock_user');
        const token = localStorage.getItem('agrostock_token');
        
        // Só considera o usuário logado se houver um token
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Função de Login: Salva usuário e token
    function login(loginData) { // loginData agora é { user, token }
        setUser(loginData.user);
        localStorage.setItem('agrostock_user', JSON.stringify(loginData.user));
        localStorage.setItem('agrostock_token', loginData.token);
    }

    // Função de Logout: Limpa usuário e token
    function logout() {
        setUser(null);
        localStorage.removeItem('agrostock_user');
        localStorage.removeItem('agrostock_token');
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}