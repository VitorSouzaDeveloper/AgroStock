import { useContext, useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { PRODUCT_CATEGORIES } from '../../constants/categories';
import api from '../../services/api';
import Modal from '../../components/Modal';
import './StockPage.style.css';
import { CapacitorBarcodeScanner } from '@capacitor/barcode-scanner';

function StockPage() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState('Todos');
    
    // Novo estado para a pesquisa
    const [searchTerm, setSearchTerm] = useState('');
    
    // NOVO: Estado para controlar a abertura dos filtros no mobile
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    // NOVO: Estado para verificar se é um dispositivo móvel
    const [isMobile, setIsMobile] = useState(false);

    // Estados dos modais e edição
    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [movementType, setMovementType] = useState('ENTRADA');
    const [movementHistory, setMovementHistory] = useState([]);

    // Refs para Movimentação
    const movementQuantityRef = useRef();
    const movementReasonRef = useRef();

    // Refs para Produto (Cadastro/Edição)
    const nameRef = useRef();
    const quantityRef = useRef();
    const categoryRef = useRef();
    const unitRef = useRef();
    const priceRef = useRef();
    const minStockRef = useRef();
    const batchRef = useRef();
    const expiryRef = useRef();
    const descriptionRef = useRef();
    const barcodeRef = useRef();

    // Novos Estados
    const [locations, setLocations] = useState([]);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [useAltUnit, setUseAltUnit] = useState(false); 

    // Novas Refs
    const newLocationNameRef = useRef(); 
    const movementLocationRef = useRef(); 
    const newProductAltUnitRef = useRef(); 
    const newProductAltFactorRef = useRef(); 

    // NOVO: Verifica se o dispositivo é móvel ao carregar a página
    useEffect(() => {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        // Verifica se é Android, iOS ou Windows Phone
        if (/android|iphone|ipad|ipod|windows phone/i.test(userAgent.toLowerCase())) {
            setIsMobile(true);
        }
    }, []);

    async function scanBarcodeForRegistration() {
        try {
            const result = await CapacitorBarcodeScanner.scanBarcode({ hint: 'ALL' });
            if (result.ScanResult && barcodeRef.current) {
                // Preenche o input do modal com o código lido!
                barcodeRef.current.value = result.ScanResult;
            }
        } catch (error) {
            console.error("Erro no scanner:", error);
        }
    }
    
    async function startScan() {
        try {
            // O plugin oficial abre a sua própria janela de câmara automaticamente
            const result = await CapacitorBarcodeScanner.scanBarcode({
                hint: 'ALL' // Permite ler tanto QR Codes como Códigos de Barras normais
            });
            
            // Se o utilizador leu um código com sucesso
            if (result.ScanResult) {
                setSearchTerm(result.ScanResult);
            }
        } catch (error) {
            console.error("Erro no scanner:", error);
            alert("Erro ao ler o código. Tente novamente.");
        }
    }

    async function fetchLocations() {
        if (user) {
            const res = await api.get(`/users/${user.id}/locations`);
            setLocations(res.data);
        }
    }

    async function handleAddLocation(e) {
        e.preventDefault();
        await api.post('/locations', { name: newLocationNameRef.current.value, ownerId: user.id });
        alert("Local adicionado!");
        setIsLocationModalOpen(false);
        fetchLocations();
    }
    
    async function fetchProducts() {
        if (user) {
            try {
                const response = await api.get(`/users/${user.id}/products`);
                setProducts(response.data);
            } catch (error) {
                console.error("Erro ao buscar produtos", error);
            }
        }
    }

    useEffect(() => { fetchProducts(); }, [user]);

    const filteredProducts = useMemo(() => {
        let filtered = products;
        
        if (categoryFilter !== 'Todos') {
            filtered = filtered.filter(p => p.category === categoryFilter);
        }
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(term) || 
                (p.barcode && p.barcode.includes(term))
            );
        }
        
        return filtered;
    }, [products, categoryFilter, searchTerm]);

    function handleLogout() { logout(); navigate('/'); }

    // --- FUNÇÕES DOS MODAIS ---

    function openAddModal() {
        setIsEditMode(false);
        setSelectedProduct(null);
        setIsProductModalOpen(true);

        setTimeout(() => {
            if (nameRef.current) {
                nameRef.current.value = "";
                quantityRef.current.value = "";
                categoryRef.current.value = "";
                unitRef.current.value = "un";
                priceRef.current.value = "";
                minStockRef.current.value = "";
                batchRef.current.value = "";
                expiryRef.current.value = "";
                descriptionRef.current.value = "";
                if (barcodeRef.current) barcodeRef.current.value = "";
            }
        }, 0);
    }

    function openEditModal(product) {
        setIsEditMode(true);
        setSelectedProduct(product);
        setIsProductModalOpen(true);

        setTimeout(() => {
            if (nameRef.current) {
                nameRef.current.value = product.name;
                quantityRef.current.value = product.quantity;
                categoryRef.current.value = product.category;
                unitRef.current.value = product.unit;
                priceRef.current.value = product.price;
                minStockRef.current.value = product.minStock || "";
                batchRef.current.value = product.batch || "";
                expiryRef.current.value = product.expiryDate ? product.expiryDate.split('T')[0] : "";
                descriptionRef.current.value = product.description || "";
                if (barcodeRef.current) barcodeRef.current.value = product.barcode || "";
            }
        }, 0);
    }

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
            alert('Erro ao carregar histórico.');
        }
    }

    function closeModals() {
        setIsMovementModalOpen(false);
        setIsHistoryModalOpen(false);
        setIsProductModalOpen(false);
        setSelectedProduct(null);
        setMovementHistory([]);
    }

    // --- LÓGICA DE SUBMISSÃO ---

    async function handleProductSubmit(event) {
        event.preventDefault();

        const productData = {
            name: nameRef.current.value,
            quantity: quantityRef.current.value,
            category: categoryRef.current.value,
            unit: unitRef.current.value,
            price: priceRef.current.value,
            minStock: minStockRef.current.value,
            batch: batchRef.current.value,
            expiryDate: expiryRef.current.value,
            description: descriptionRef.current.value,
            barcode: barcodeRef.current.value,
            ownerId: user.id
        };

        try {
            if (isEditMode && selectedProduct) {
                await api.put(`/products/${selectedProduct.id}`, productData);
                alert("Produto atualizado com sucesso!");
            } else {
                await api.post('/products', productData);
                alert("Produto cadastrado com sucesso!");
            }
            closeModals();
            fetchProducts();
        } catch (error) {
            alert("Erro ao salvar produto.");
        }
    }

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
            alert(error.response?.data?.error || 'Erro na movimentação.');
        }
    }

    async function handleDeleteProduct(productId) {
        if (window.confirm("Tem certeza? Isso apagará todo o histórico deste item.")) {
            try {
                await api.delete(`/products/${productId}`);
                fetchProducts();
            } catch (error) {
                alert("Erro ao deletar.");
            }
        }
    }

    // --- RENDERIZAÇÃO ---

    return (
        <div className="dashboard-container">
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
                    <button className="add-new-product-button" onClick={openAddModal}>
                        + Adicionar Novo Produto
                    </button>
                </div>

                {/* 3. A Barra de Pesquisa */}
                <div className="search-container">
                    <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <input
                        type="text"
                        placeholder="Pesquisar pelo nome ou código de barras..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    {/* ATUALIZADO: Renderização condicional para o scanner na pesquisa */}
                    {isMobile && (
                        <button onClick={startScan} style={{ background: 'none', border: 'none', color: '#48BB78', cursor: 'pointer', padding: '5px' }}>
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8V6a2 2 0 012-2h3m10 0h3a2 2 0 012 2v2M3 16v2a2 2 0 002 2h3m10 0h3a2 2 0 002-2v-2M8 12h8"></path>
                            </svg>
                        </button>
                    )}
                </div>

                {/* NOVO: Botão de alternar filtros exclusivo para mobile */}
                <button 
                    className="mobile-filter-toggle" 
                    onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                    </svg>
                    {isFiltersOpen ? "Esconder Filtros" : "Filtrar Produtos"}
                    {categoryFilter !== 'Todos' && <span className="filter-badge">1</span>}
                </button>

                {/* ATUALIZADO: A div de filtros agora reage ao estado isFiltersOpen no mobile */}
                <div className={`filter-container ${isFiltersOpen ? 'open' : ''}`}>
                    <button className={`filter-button ${categoryFilter === 'Todos' ? 'active' : ''}`} onClick={() => setCategoryFilter('Todos')}>Todos</button>
                    {PRODUCT_CATEGORIES.map(cat => (
                        <button key={cat} className={`filter-button ${categoryFilter === cat ? 'active' : ''}`} onClick={() => setCategoryFilter(cat)}>{cat}</button>
                    ))}
                </div>

                <div className="stock-list">
                    {filteredProducts.length > 0 ? filteredProducts.map(product => (
                        <div key={product.id} className="product-item">

                            <div className="card-icons" style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px', zIndex: 2 }}>
                                <button className="icon-btn info" onClick={() => openEditModal(product)} title="Ver detalhes e Editar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3182ce' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: '18px', height: '18px' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                                <button className="icon-btn delete" onClick={() => handleDeleteProduct(product.id)} title="Excluir" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e53e3e' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: '18px', height: '18px' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>

                            <h3>{product.name}</h3>

                            <div className="product-details">
                                <p>
                                    <strong>Qtd:</strong> {product.quantity}
                                    <span style={{ backgroundColor: '#2D3748', padding: '2px 6px', borderRadius: '4px', marginLeft: '5px', fontSize: '12px', border: '1px solid #4A5568' }}>
                                        {product.unit.toUpperCase()}
                                    </span>
                                </p>
                                <p><strong>Categoria:</strong> {product.category}</p>
                                <p><strong>Valor:</strong> R$ {Number(product.price).toFixed(2)}</p>

                                <p style={{ marginTop: '8px', borderTop: '1px solid #4A5568', paddingTop: '8px' }}>
                                    <strong>Lote:</strong> {product.batch || '-'} <br />
                                    <strong>Validade:</strong> {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString('pt-BR') : '-'}
                                </p>
                            </div>

                            {(() => {
                                const alertStyle = { fontWeight: 'bold', marginTop: '10px', paddingRight: '30px', fontSize: '13px' };

                                if (product.quantity <= (product.minStock || 0)) {
                                    return <p style={{ ...alertStyle, color: '#e53e3e' }}>⚠️ Estoque Baixo!</p>;
                                }

                                if (!product.expiryDate) return null;
                                const today = new Date(); today.setHours(0, 0, 0, 0);
                                const expiry = new Date(product.expiryDate); expiry.setHours(0, 0, 0, 0);
                                const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

                                if (diffDays < 0) return <p style={{ ...alertStyle, color: '#e53e3e' }}>☠️ VENCIDO!</p>;
                                if (diffDays <= 30) return <p style={{ ...alertStyle, color: '#dd6b20' }}>⚠️ VENCE EM {diffDays} DIAS</p>;

                                return null;
                            })()}

                            <div className="product-actions">
                                <button className="edit-button" onClick={() => openMovementModal(product, 'ENTRADA')}>Adicionar</button>
                                <button className="subtract-button" onClick={() => openMovementModal(product, 'SAIDA')}>Retirar</button>
                                <button className="history-button" onClick={() => openHistoryModal(product)}>Histórico</button>
                            </div>
                        </div>
                    )) : <p>Nenhum produto encontrado com estes filtros.</p>}
                </div>
            </main>

            {/* MODAL DE CADASTRO / EDIÇÃO */}
            <Modal isOpen={isProductModalOpen} onClose={closeModals} title={isEditMode ? "Editar Produto" : "Adicionar Novo Produto"}>
                <form onSubmit={handleProductSubmit}>
                    <div className="form-group">
                        <label>Nome do Produto <span style={{ color: '#e53e3e' }}>*</span></label>
                        <input type="text" ref={nameRef} required placeholder="Ex: Milho Híbrido" />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Categoria <span style={{ color: '#e53e3e' }}>*</span></label>
                            <select ref={categoryRef} required>
                                <option value="">Selecione...</option>
                                {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Unidade <span style={{ color: '#e53e3e' }}>*</span></label>
                            <select ref={unitRef} defaultValue="un">
                                <option value="un">Unidade (un)</option>
                                <option value="kg">Quilograma (kg)</option>
                                <option value="lt">Litro (l)</option>
                                <option value="sc">Saco (sc)</option>
                                <option value="ton">Tonelada (ton)</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Qtd Inicial <span style={{ color: '#e53e3e' }}>*</span></label>
                            <input type="number" ref={quantityRef} required min="0" />
                        </div>
                        <div className="form-group">
                            <label>Estoque Mínimo</label>
                            <input type="number" ref={minStockRef} placeholder="0" />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Preço (R$)</label>
                            <input type="number" step="0.01" ref={priceRef} placeholder="0.00" />
                        </div>
                        <div className="form-group">
                            <label>Lote</label>
                            <input type="text" ref={batchRef} placeholder="Ex: A-25" />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Código de Barras (EAN/QR)</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input type="text" ref={barcodeRef} placeholder="Digite ou escaneie..." style={{ flex: 1 }} />
                                {isMobile && (
                                    <button 
                                        type="button" 
                                        onClick={scanBarcodeForRegistration}
                                        style={{ backgroundColor: '#48BB78', color: 'white', border: 'none', borderRadius: '8px', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    >
                                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8V6a2 2 0 012-2h3m10 0h3a2 2 0 012 2v2M3 16v2a2 2 0 002 2h3m10 0h3a2 2 0 002-2v-2M8 12h8"></path>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="form-group" style={{ maxWidth: '160px' }}>
                            <label>Validade</label>
                            <input type="date" ref={expiryRef} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Descrição</label>
                        <textarea ref={descriptionRef} rows="2" placeholder="Detalhes opcionais..."></textarea>
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={closeModals} className="cancel-button">Cancelar</button>
                        <button type="submit" className="save-button">{isEditMode ? "Atualizar" : "Salvar"}</button>
                    </div>
                </form>
            </Modal>

            {/* MODAL MOVIMENTAÇÃO */}
            <Modal isOpen={isMovementModalOpen} onClose={closeModals} title={`${movementType === 'ENTRADA' ? 'Adicionar' : 'Remover'}: ${selectedProduct?.name}`}>
                <form onSubmit={handleMovementSubmit}>
                    <div className="form-group">
                        <label>Quantidade</label>
                        <input type="number" ref={movementQuantityRef} required min="1" />
                    </div>
                    <div className="form-group">
                        <label>Motivo</label>
                        <input type="text" ref={movementReasonRef} />
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={closeModals} className="cancel-button">Cancelar</button>
                        <button type="submit" className="save-button">Confirmar</button>
                    </div>
                </form>
            </Modal>

            {/* MODAL HISTÓRICO */}
            <Modal isOpen={isHistoryModalOpen} onClose={closeModals} title={`Histórico: ${selectedProduct?.name}`}>
                <div className="history-list">
                    {movementHistory.length > 0 ? movementHistory.map(mov => (
                        <div key={mov.id} className={`history-item ${mov.type.toLowerCase()}`}>
                            <p><strong>{mov.type}</strong>: {mov.quantity} | {mov.reason}</p>
                            <p className="date">{new Date(mov.createdAt).toLocaleString()}</p>
                        </div>
                    )) : <p>Sem histórico.</p>}
                </div>
            </Modal>
        </div>
    );
}

export default StockPage;