import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const layoutStyle = {
    display: 'flex',
    height: '100vh',
    width: '100vw',
};

const contentStyle = {
    flex: 1,
    overflowY: 'auto', // Permite scroll no conteúdo se for grande
    padding: '20px',
};

function DashboardLayout() {
    return (
        <div style={layoutStyle}>
            <Sidebar />
            <main style={contentStyle}>
                {/* O Outlet renderiza o componente da rota filha (Estoque, Relatórios, etc.) */}
                <Outlet />
            </main>
        </div>
    );
}

export default DashboardLayout;