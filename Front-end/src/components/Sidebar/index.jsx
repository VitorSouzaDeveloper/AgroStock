import { NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import './style.css';

// Ícone do Logo (versão simplificada para a sidebar)
const SidebarLogoIcon = () => (
    <svg className="sidebar-logo-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="40" width="40" height="50" rx="5" fill="#2D3748" stroke="#4A5568" strokeWidth="3"/>
        <path d="M30 40 Q 50 25, 70 40 Z" fill="#2D3748" stroke="#4A5568" strokeWidth="3" />
        <path d="M 50 10 C 30 30, 30 70, 50 90 C 70 70, 70 30, 50 10 Z" fill="#48BB78" transform="rotate(30 50 50)"/>
        <line x1="50" y1="30" x2="50" y2="90" stroke="white" strokeWidth="3" transform="rotate(30 50 50)" />
    </svg>
);

// Ícones dos links de navegação
const InventoryIcon = () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>;
const ReportIcon = () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5l4 4h2a2 2 0 012 2v7a2 2 0 01-2 2z"></path></svg>;
const AdminIcon = () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>;

function Sidebar() {
    const { user } = useContext(AuthContext);

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                {/* Adicionando o ícone ao lado do texto */}
                <SidebarLogoIcon />
                <h3>AgroStock</h3>
            </div>
            <nav className="sidebar-nav">
                <NavLink to="/dashboard/stock" className="nav-link">
                    <InventoryIcon />
                    <span>Estoque</span>
                </NavLink>
                <NavLink to="/dashboard/reports" className="nav-link">
                    <ReportIcon />
                    <span>Relatórios</span>
                </NavLink>
                {user && user.role === 'ADMIN' && (
                    <NavLink to="/admin" className="nav-link">
                        <AdminIcon />
                        <span>Admin</span>
                    </NavLink>
                )}
            </nav>
        </aside>
    );
}

export default Sidebar;