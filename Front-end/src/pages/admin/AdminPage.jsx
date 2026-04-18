import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';
import './AdminPage.style.css';

function AdminPage() {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    async function fetchUsers() {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (error) {
            alert('Você não tem permissão para ver esta página.');
            console.error(error);
        }
    }

    useEffect(() => {
        if (user) fetchUsers();
    }, [user]);

    async function handleDeleteUser(userId) {
        if (window.confirm("Tem certeza que deseja deletar este usuário? A ação é irreversível.")) {
            try {
                await api.delete(`/admin/users/${userId}`);
                alert('Usuário deletado com sucesso.');
                fetchUsers();
            } catch (error) {
                alert('Erro ao deletar usuário.');
            }
        }
    }

    async function handleToggleAdmin(targetUser) {
        const newRole = targetUser.role === 'ADMIN' ? 'USER' : 'ADMIN';
        const action = newRole === 'ADMIN' ? 'promover' : 'rebaixar';

        if (window.confirm(`Tem certeza que deseja ${action} ${targetUser.name}?`)) {
            try {
                await api.put(`/admin/users/${targetUser.id}/role`, 
                    { role: newRole }
                );
                alert(`Usuário ${action === 'promover' ? 'promovido' : 'rebaixado'} com sucesso.`);
                fetchUsers();
            } catch (error) {
                alert(`Erro ao ${action} usuário.`);
            }
        }
    }

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div>
                    <h1>Painel de Administração</h1>
                    <p>Gerenciamento de usuários do sistema.</p>
                </div>
            </div>

            <div className="search-container">
                <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input
                    type="text"
                    placeholder="Pesquisar utilizador por nome ou e-mail..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <main>
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Função (Role)</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>

                        {filteredUsers.map(u => (
                            <tr key={u.id}>
                                <td>{u.name}</td>
                                <td>{u.email}</td>
                                <td>{u.role}</td>
                                <td>
                                    {user.id !== u.id && (
                                        <>
                                            <button onClick={() => handleToggleAdmin(u)} className="promote-btn">
                                                {u.role === 'ADMIN' ? 'Rebaixar' : 'Promover a Admin'}
                                            </button>
                                            <button onClick={() => handleDeleteUser(u.id)} className="delete-btn">
                                                Deletar
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                                    Nenhum utilizador encontrado com "{searchTerm}".
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </main>
        </div>
    );
}

export default AdminPage;