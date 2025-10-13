import { useContext, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';
import './ReportsPage.style.css';

function ReportsPage() {
    const { user } = useContext(AuthContext);
    const [summaryData, setSummaryData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSummary() {
            if (user) {
                try {
                    const response = await api.get(`/reports/${user.id}/category-summary`);
                    setSummaryData(response.data);
                } catch (error) {
                    console.error("Erro ao buscar dados do relatório", error);
                    alert("Não foi possível carregar os dados do relatório.");
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchSummary();
    }, [user]);

    return (
        <div className="reports-container">
            <header>
                <h1>Relatórios Gerenciais</h1>
            </header>

            <section className="report-widget">
                <h2>Quantidade de Itens por Categoria</h2>
                {loading ? (
                    <p>Carregando dados...</p>
                ) : (
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                                data={summaryData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                                <XAxis dataKey="category" stroke="#F7FAFC" />
                                <YAxis stroke="#F7FAFC" />
                                <Tooltip
                                    cursor={{ fill: '#2D3748' }}
                                    contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }}
                                />
                                <Legend />
                                <Bar dataKey="totalQuantity" name="Quantidade Total" fill="#48BB78" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </section>
        </div>
    );
}

export default ReportsPage;