import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';

// Importando os Layouts e Páginas
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/login';
import Home from './pages/home';
import StockPage from './pages/stock/StockPage';
import ReportsPage from './pages/reports/ReportsPage';
import AdminPage from './pages/admin/AdminPage';

// Componente para proteger rotas que exigem login
function PrivateRoute({ children }) {
    const { isAuthenticated } = useContext(AuthContext);
    // Se não estiver autenticado, redireciona para a página de login
    return isAuthenticated ? children : <Navigate to="/" />;
}

// Componente para proteger rotas que exigem ser Admin
function AdminRoute({ children }) {
    const { isAuthenticated, user } = useContext(AuthContext);
    // Verifica se está autenticado E se a função é 'ADMIN'
    const isAuthAndAdmin = isAuthenticated && user?.role === 'ADMIN';
    // Se não for admin, redireciona para a dashboard principal
    return isAuthAndAdmin ? children : <Navigate to="/dashboard/stock" />;
}

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* --- Rotas Públicas --- */}
                <Route path="/" element={<Login />} />
                <Route path="/signup" element={<Home />} />

                {/* --- Rotas da Dashboard (para usuários logados) --- */}
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <DashboardLayout />
                        </PrivateRoute>
                    }
                >
                    {/* Rotas "Filhas" que aparecem dentro do layout */}
                    <Route index element={<Navigate to="stock" replace />} />
                    <Route path="stock" element={<StockPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                </Route>
                
                {/* --- Rota do Admin (só para admins logados) --- */}
                <Route 
                    path="/admin" 
                    element={
                        <AdminRoute>
                            <DashboardLayout />
                        </AdminRoute>
                    }
                >
                     <Route index element={<AdminPage />} />
                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;