import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './ReportsPage.style.css';

function ReportsPage() {
    const { user } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    useEffect(() => {
        async function fetchData() {
            if (user) {
                try {
                    const response = await api.get(`/reports/${user.id}/full-dashboard`);
                    setData(response.data);
                } catch (error) {
                    console.error("Erro ao buscar dados", error);
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchData();
    }, [user]);

    function exportToCSV() {
        if (!data?.products) return;
        const headers = ["Nome", "Categoria", "Qtd", "Valor Unit (R$)", "Valor Total (R$)"];
        const rows = data.products.map(p => [
            p.name, p.category, p.quantity, p.price.toFixed(2), p.totalValue.toFixed(2)
        ]);
        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "relatorio_estoque.csv");
        document.body.appendChild(link);
        link.click();
    }

    function exportToPDF() {
        if (!data?.products) return;
        const doc = new jsPDF();
        doc.text("Relatório de Estoque - AgroStock", 14, 10);
        doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 14, 18);
        const tableColumn = ["Produto", "Categoria", "Qtd", "V. Unit", "V. Total"];
        const tableRows = [];
        data.products.forEach(product => {
            tableRows.push([
                product.name,
                product.category,
                product.quantity,
                `R$ ${product.price.toFixed(2)}`,
                `R$ ${product.totalValue.toFixed(2)}`
            ]);
        });
        autoTable(doc, { head: [tableColumn], body: tableRows, startY: 25 });
        const finalY = (doc.lastAutoTable?.finalY || 25) + 10;
        doc.text(`Valor Total em Estoque: R$ ${data.kpis.totalValue.toFixed(2)}`, 14, finalY);
        doc.save("relatorio_estoque.pdf");
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip" style={{
                    backgroundColor: '#2D3748',
                    padding: '10px',
                    border: '1px solid #4A5568',
                    borderRadius: '5px'
                }}>
                    <p style={{ color: '#E2E8F0', fontWeight: 'bold', marginBottom: '5px' }}>{`${payload[0].name}`}</p>
                    <p style={{ color: '#48BB78' }}>{`Qtd: ${payload[0].value}`}</p>
                </div>
            );
        }
        return null;
    };

    if (loading) return <div className="loading">Carregando Dashboard...</div>;

    return (
        <div className="reports-container">
            <header className="reports-header">
                <h1>Relatórios Gerenciais</h1>
                <div className="export-buttons">
                    <button onClick={exportToCSV} className="btn-export csv">Exportar CSV</button>
                    <button onClick={exportToPDF} className="btn-export pdf">Exportar PDF</button>
                </div>
            </header>

        
            <div className="kpi-grid">
                <div className="kpi-card">
                    <h3>Valor Total em Estoque</h3>
                    <p className="kpi-value money">R$ {data?.kpis?.totalValue.toFixed(2)}</p>
                </div>
                <div className="kpi-card">
                    <h3>Total de Itens</h3>
                    <p className="kpi-value">{data?.kpis?.totalItems}</p>
                </div>
                <div className="kpi-card">
                    <h3>Produtos Diferentes</h3>
                    <p className="kpi-value">{data?.kpis?.productsCount}</p>
                </div>
                <div className="kpi-card warning">
                    <h3>Estoque Baixo</h3>
                    <p className="kpi-value">{data?.kpis?.lowStockCount}</p>
                </div>
            </div>

            <div className="reports-content">
                <section className="chart-section">
                    <h2>Distribuição por Categoria</h2>
                    <div className="chart-wrapper" style={{ height: 350 }}> 
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data?.chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80} 
                                    outerRadius={120}
                                    paddingAngle={5} 
                                    dataKey="value"
                                >
                                    {data?.chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                <section className="table-section">
                    <h2>Detalhamento do Estoque</h2>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Categoria</th>
                                <th>Qtd</th>
                                <th>V. Unit</th>
                                <th>V. Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.products.map(p => (
                                <tr key={p.id}>
                                    <td>{p.name}</td>
                                    <td>{p.category || '-'}</td>
                                    <td>{p.quantity}</td>
                                    <td>R$ {p.price.toFixed(2)}</td>
                                    <td><strong>R$ {p.totalValue.toFixed(2)}</strong></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>
        </div>
    );
}

export default ReportsPage;