import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppRoutes from './routes';
import { AuthProvider } from './contexts/AuthContext'; // 1. Importe o AuthProvider

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 2. Envolva o AppRoutes com o AuthProvider */}
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </StrictMode>,
);