import express from 'express';
import cors from 'cors';
import pkg from './generated/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; 
import 'dotenv/config'; 

const PrismaClient = pkg.PrismaClient ?? pkg.default?.PrismaClient;
const prisma = new PrismaClient();

const app = express();
const port = 3000;

app.use(express.json());

app.use(cors({
    origin: [
        "https://agro-stock-k6cn.vercel.app",
        "https://agro-stock.vercel.app",
        "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// --- ROTAS DE USUÁRIO E AUTH ---

app.post('/users', async (req, res) => {
    const { name, email, idade, senha } = req.body;
    if (!name || !email || !senha) return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });

    try {
        const hashedSenha = await bcrypt.hash(senha, 10);
        const user = await prisma.user.create({
            data: { name, email, idade, senha: hashedSenha, role: 'USER' },
        });
        const { senha: _, ...userWithoutPassword } = user;
        return res.status(201).json(userWithoutPassword);
    } catch (error) {
        if (error.code === 'P2002') return res.status(409).json({ error: 'E-mail já em uso.' });
        return res.status(500).json({ error: 'Erro interno.' });
    }
});

app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ error: 'Dados incompletos.' });
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(senha, user.senha))) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
        const { senha: _, ...userWithoutPassword } = user;
        return res.status(200).json({ user: userWithoutPassword, token });
    } catch (error) { return res.status(500).json({ error: 'Erro interno.' }); }
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(401).json({ error: 'Token necessário.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, userPayload) => {
        if (err) return res.status(403).json({ error: 'Token inválido.' });
        req.user = userPayload;
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') next();
    else return res.status(403).json({ error: 'Requer Admin.' });
};

// --- ROTAS DE ADMIN ---
app.get('/admin/users', authenticateToken, isAdmin, async (req, res) => {
    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, idade: true } });
    res.json(users);
});

app.put('/admin/users/:id/role', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    if (role !== 'ADMIN' && role !== 'USER') return res.status(400).json({ error: "Role inválida." });
    const updatedUser = await prisma.user.update({ where: { id }, data: { role }, select: { id: true, name: true, role: true } });
    res.json(updatedUser);
});

app.delete('/admin/users/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    if (req.user.id === id) return res.status(400).json({ error: 'Não pode se auto-excluir.' });
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
});

// --- ROTAS DE PRODUTOS ---

app.get('/users/:userId/products', authenticateToken, async (req, res) => {
    if (req.user.id !== req.params.userId && req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado.' });
    const products = await prisma.product.findMany({ where: { ownerId: req.params.userId }, orderBy: { createdAt: 'desc' } });
    res.json(products);
});

app.post('/products', authenticateToken, async (req, res) => {
    const { name, quantity, category, unit, price, minStock, description, batch, expiryDate, ownerId } = req.body;

    if (req.user.id !== ownerId) return res.status(403).json({ error: "Não permitido." });
    if (!name || !quantity || !ownerId) return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });

    try {
        const product = await prisma.product.create({
            data: {
                name, category, ownerId,
                quantity: parseInt(quantity, 10),
                unit: unit || 'un',
                price: parseFloat(price) || 0,
                minStock: parseInt(minStock, 10) || 0,
                description: description || '',
                batch: batch || null,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
            },
        });
        return res.status(201).json(product);
    } catch (error) { return res.status(500).json({ error: 'Erro ao criar produto.' }); }
});

app.put('/products/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, quantity, category, unit, price, minStock, description, batch, expiryDate } = req.body;

    try {
        const existingProduct = await prisma.product.findUnique({ where: { id } });
        if (!existingProduct || existingProduct.ownerId !== req.user.id) return res.status(403).json({ error: 'Acesso negado.' });

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                name, category, description, batch, unit,
                quantity: parseInt(quantity, 10),
                price: parseFloat(price) || 0,
                minStock: parseInt(minStock, 10) || 0,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
            },
        });
        return res.status(200).json(updatedProduct);
    } catch (error) { return res.status(500).json({ error: 'Erro ao atualizar.' }); }
});

app.delete('/products/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.product.delete({ where: { id } });
        return res.status(204).send();
    } catch (error) { return res.status(500).json({ error: 'Erro ao deletar.' }); }
});

// --- MOVIMENTAÇÃO ---

app.post('/products/:productId/add-stock', authenticateToken, async (req, res) => {
    const { productId } = req.params;
    const { quantity, reason } = req.body;
    const movementQuantity = parseInt(quantity, 10);
    if (!movementQuantity || movementQuantity <= 0) return res.status(400).json({ error: 'Quantidade inválida.' });

    try {
        const [, updatedProduct] = await prisma.$transaction([
            prisma.stockMovement.create({
                data: { productId, quantity: movementQuantity, type: 'ENTRADA', reason },
            }),
            prisma.product.update({
                where: { id: productId },
                data: { quantity: { increment: movementQuantity } },
            }),
        ]);
        return res.status(200).json(updatedProduct);
    } catch (error) { return res.status(500).json({ error: 'Erro na entrada.' }); }
});

app.post('/products/:productId/remove-stock', authenticateToken, async (req, res) => {
    const { productId } = req.params;
    const { quantity, reason } = req.body;
    const movementQuantity = parseInt(quantity, 10);
    if (!movementQuantity || movementQuantity <= 0) return res.status(400).json({ error: 'Quantidade inválida.' });

    try {
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product || product.quantity < movementQuantity) return res.status(400).json({ error: 'Estoque insuficiente.' });

        const [, updatedProduct] = await prisma.$transaction([
            prisma.stockMovement.create({
                data: { productId, quantity: movementQuantity, type: 'SAIDA', reason },
            }),
            prisma.product.update({
                where: { id: productId },
                data: { quantity: { decrement: movementQuantity } },
            }),
        ]);
        return res.status(200).json(updatedProduct);
    } catch (error) { return res.status(500).json({ error: 'Erro na saída.' }); }
});

app.get('/products/:productId/history', authenticateToken, async (req, res) => {
    const { productId } = req.params;
    try {
        const history = await prisma.stockMovement.findMany({ where: { productId }, orderBy: { createdAt: 'desc' } });
        return res.status(200).json(history);
    } catch (error) { return res.status(500).json({ error: 'Erro no histórico.' }); }
});

// --- RELATÓRIOS ---
app.get('/reports/:userId/full-dashboard', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    if (req.user.id !== userId && req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado.' });

    try {
        const products = await prisma.product.findMany({ where: { ownerId: userId }, orderBy: { name: 'asc' } });
        let totalItems = 0, totalValue = 0, lowStockCount = 0;
        const categoryMap = {};

        const productsWithTotal = products.map(p => {
            const pTotal = p.quantity * p.price;
            totalItems += p.quantity;
            totalValue += pTotal;
            if (p.quantity <= (p.minStock || 0)) lowStockCount++;
            const cat = p.category || 'Sem Categoria';
            categoryMap[cat] = (categoryMap[cat] || 0) + p.quantity;
            return { ...p, totalValue: pTotal };
        });

        const chartData = Object.keys(categoryMap).map(key => ({ name: key, value: categoryMap[key] }));

        res.json({
            kpis: { totalItems, totalValue, lowStockCount, productsCount: products.length },
            chartData,
            products: productsWithTotal
        });
    } catch (error) { res.status(500).json({ error: 'Erro no dashboard.' }); }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => { console.log(`Servidor rodando localmente na porta ${port}`); });
}

export default app;