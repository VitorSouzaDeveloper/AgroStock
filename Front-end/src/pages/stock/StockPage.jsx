import { useContext, useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { PRODUCT_CATEGORIES } from '../../constants/categories';
import api from '../../services/api';
import Modal from '../../components/Modal';
import './StockPage.style.css';

function StockPage() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState('Todos');

    // Estados dos modais
    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [movementType, setMovementType] = useState('ENTRADA');
    const [movementHistory, setMovementHistory] = useState([]);
    
    // Refs para os formulários
    const movementQuantityRef = useRef();
    const movementReasonRef = useRef();
    const newProductNameRef = useRef();
    const newProductQuantityRef = useRef();
    const newProductCategoryRef = useRef();

    // --- LÓGICA DE DADOS E NAVEGAÇÃO ---

    async function fetchProducts() {
        if (user) {
            try {
                const response = await api.get(`/users/${user.id}/products`);
                setProducts(response.data);
            } catch (error) {
                console.error("Erro ao buscar produtos", error);
                alert("Não foi possível carregar seus produtos.");
            }
        }
    }

    useEffect(() => { fetchProducts(); }, [user]);

    const filteredProducts = useMemo(() => {
        if (categoryFilter === 'Todos') {
            return products;
        }
        return products.filter(product => product.category === categoryFilter);
    }, [products, categoryFilter]);

    // *** A FUNÇÃO QUE ESTAVA FALTANDO ESTÁ AQUI ***
    function handleLogout() {
        logout();
        navigate('/');
    }
    
    // --- FUNÇÕES DOS MODAIS ---

    function openMovementModal(product, type) {
        setSelectedProduct(product);
        setMovementType(type);
        setIsMovementModalOpen(true);
    }

    async function openHistoryModal(product) {
        setSelectedProduct(product);
        try {
            const response = await api.get(`/products/${product.id}/history`);
            setMovementHistory(response.data);
            setIsHistoryModalOpen(true);
        } catch (error) {
            alert('Não foi possível carregar o histórico.');
        }
    }

    function openAddProductModal() {
        setIsAddProductModalOpen(true);
    }
    
    function closeModals() {
        setIsMovementModalOpen(false);
        setIsHistoryModalOpen(false);
        setIsAddProductModalOpen(false);
        setSelectedProduct(null);
        setMovementHistory([]);
    }
    
    // --- LÓGICA DE SUBMISSÃO ---

    async function handleMovementSubmit(event) {
        event.preventDefault();
        const quantity = movementQuantityRef.current.value;
        const reason = movementReasonRef.current.value;
        const endpoint = movementType === 'ENTRADA' ? 'add-stock' : 'remove-stock';

        try {
            await api.post(`/products/${selectedProduct.id}/${endpoint}`, { quantity, reason });
            alert(`Movimentação registrada!`);
            closeModals();
            fetchProducts();
        } catch (error) {
            alert(error.response?.data?.error || 'Falha ao registrar movimentação.');
        }
    }
    
    async function handleAddProductSubmit(event) {
        event.preventDefault();
        const name = newProductNameRef.current.value;
        const quantity = newProductQuantityRef.current.value;
        const category = newProductCategoryRef.current.value;

        if (!name || !quantity || !category) {
            alert("Todos os campos são obrigatórios.");
            return;
        }

        try {
            await api.post('/products', { name, quantity, category, ownerId: user.id });
            alert("Novo produto cadastrado com sucesso!");
            closeModals();
            fetchProducts();
        } catch (error) {
            alert("Não foi possível cadastrar o novo produto.");
        }
    }

    async function handleDeleteProduct(productId) {
        if (window.confirm("Atenção: Isso irá remover o produto e todo o seu histórico. Deseja continuar?")) {
            try {
                await api.delete(`/products/${productId}`);
                alert("Produto deletado com sucesso!");
                fetchProducts();
            } catch (error) {
                alert("Não foi possível deletar o produto.");
            }
        }
    }

    // --- RENDERIZAÇÃO DO COMPONENTE ---

    return (
        <>
            <div className="stock-container">
                <header>
                    <h1>Meu Estoque</h1>
                    <div className="user-info">
                        <span>Olá, {user?.name}</span>
                        <button onClick={handleLogout}>Sair</button>
                    </div>
                </header>
                <main>
                    <div className="stock-header">
                        <h2>Itens Cadastrados</h2>
                        <button className="add-new-product-button" onClick={openAddProductModal}>
                            + Adicionar Novo Produto
                        </button>
                    </div>

                    <div className="filter-container">
                        <button 
                            className={`filter-button ${categoryFilter === 'Todos' ? 'active' : ''}`}
                            onClick={() => setCategoryFilter('Todos')}
                        >
                            Todos
                        </button>
                        {PRODUCT_CATEGORIES.map(category => (
                            <button 
                                key={category}
                                className={`filter-button ${categoryFilter === category ? 'active' : ''}`}
                                onClick={() => setCategoryFilter(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    <div className="stock-list">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <div key={product.id} className="product-item">
                                    <h3>{product.name}</h3>
                                    <p><strong>Quantidade:</strong> {product.quantity}</p>
                                    <p><strong>Categoria:</strong> {product.category || 'Não definida'}</p>
                                    
                                    <div className="product-actions">
                                        <button className="edit-button" onClick={() => openMovementModal(product, 'ENTRADA')}>Adicionar</button>
                                        <button className="delete-button" onClick={() => handleDeleteProduct(product.id)}>Remover</button>
                                        <button className="history-button" onClick={() => openHistoryModal(product)}>Histórico</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Nenhum produto encontrado. Adicione um novo item ou altere o filtro de categoria.</p>
                        )}
                    </div>
                </main>
            </div>

            {/* --- MODAIS --- */}

            <Modal isOpen={isAddProductModalOpen} onClose={closeModals} title="Adicionar Novo Produto ao Estoque">
                <form onSubmit={handleAddProductSubmit}>
                    <div className="form-group">
                        <label>Nome do Produto</label>
                        <input type="text" ref={newProductNameRef} required />
                    </div>
                    <div className="form-group">
                        <label>Quantidade Inicial</label>
                        <input type="number" ref={newProductQuantityRef} required min="0" />
                    </div>
                    <div className="form-group">
                        <label>Categoria</label>
                        <select ref={newProductCategoryRef} required>
                            <option value="">Selecione uma categoria</option>
                            {PRODUCT_CATEGORIES.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit">Cadastrar Produto</button>
                </form>
            </Modal>

            <Modal isOpen={isMovementModalOpen} onClose={closeModals} title={`${movementType === 'ENTRADA' ? 'Adicionar ao' : 'Remover do'} Estoque: ${selectedProduct?.name}`}>
                <form onSubmit={handleMovementSubmit}>
                    <div className="form-group">
                        <label>Quantidade</label>
                        <input type="number" ref={movementQuantityRef} required min="1" />
                    </div>
                    <div className="form-group">
                        <label>Motivo (opcional)</label>
                        <input type="text" ref={movementReasonRef} />
                    </div>
                    <button type="submit">Confirmar</button>
                </form>
            </Modal>

            <Modal isOpen={isHistoryModalOpen} onClose={closeModals} title={`Histórico de: ${selectedProduct?.name}`}>
                <div className="history-list">
                    {movementHistory.length > 0 ? movementHistory.map(mov => (
                        <div key={mov.id} className={`history-item ${mov.type.toLowerCase()}`}>
                            <p><strong>Tipo:</strong> {mov.type} | <strong>Qtd:</strong> {mov.quantity}</p>
                            {mov.reason && <p className="reason"><strong>Motivo:</strong> {mov.reason}</p>}
                            <p className="date">{new Date(mov.createdAt).toLocaleString('pt-BR')}</p>
                        </div>
                    )) : <p>Nenhuma movimentação registrada.</p>}
                </div>
            </Modal>
        </>
    );
}

export default StockPage;