import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';
import './AdminPage.style.css';

function AdminPage() {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);

    async function fetchUsers() {
        try {
            // Não é mais necessário enviar o header 'x-user-id'
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
                // Não é mais necessário enviar o header 'x-user-id'
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
                 // Não é mais necessário enviar o header 'x-user-id'
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

    return (
        <div className="admin-container">
            <h1>Painel de Administração</h1>
            <p>Gerenciamento de usuários do sistema.</p>

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
                    {users.map(u => (
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
                </tbody>
            </table>
        </div>
    );
}

export default AdminPage;