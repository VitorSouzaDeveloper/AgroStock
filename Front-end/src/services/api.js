import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
});

// Interceptor que adiciona o token a todas as requisições
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('agrostock_token');
        if (token) {
            // Adiciona o cabeçalho de autorização no formato Bearer
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;