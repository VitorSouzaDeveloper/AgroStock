import express from 'express';
import cors from 'cors';
import pkg from './generated/prisma/index.js';
import bcrypt from 'bcrypt';

const PrismaClient = pkg.PrismaClient ?? pkg.default?.PrismaClient;
const prisma = new PrismaClient();

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// --- Rota de Cadastro (pública) ---
app.post('/users', async (req, res) => {
    const { name, email, idade, senha } = req.body;
    if (!name || !email || !senha) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes: name, email, senha.' });
    }

    try {
        const hashedSenha = await bcrypt.hash(senha, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                idade,
                senha: hashedSenha,
                role: 'USER' // Garante que todo novo usuário seja 'USER'
            },
        });
        const { senha: _, ...userWithoutPassword } = user;
        return res.status(201).json(userWithoutPassword);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Este e-mail já está em uso.' });
        }
        console.error(error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// --- Rota de Login (pública) ---
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
        }
        const passwordMatch = await bcrypt.compare(senha, user.senha);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
        }
        const { senha: _, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});


// --- MIDDLEWARE DE VERIFICAÇÃO DE ADMIN ---
const isAdmin = async (req, res, next) => {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({ error: 'Acesso não autorizado.' });
    }
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user && user.role === 'ADMIN') {
            next();
        } else {
            return res.status(403).json({ error: 'Acesso proibido. Requer privilégios de administrador.' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

// --- ROTAS DE ADMINISTRAÇÃO (protegidas) ---
app.get('/admin/users', isAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, idade: true }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuários.' });
    }
});

app.put('/admin/users/:id/role', isAdmin, async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    if (role !== 'ADMIN' && role !== 'USER') {
        return res.status(400).json({ error: "A função deve ser 'ADMIN' ou 'USER'." });
    }
    try {
        const updatedUser = await prisma.user.update({
            where: { id },
            data: { role },
            select: { id: true, name: true, email: true, role: true, idade: true }
        });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar a função do usuário.' });
    }
});

app.delete('/admin/users/:id', isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        if (req.headers['x-user-id'] === id) {
            return res.status(400).json({ error: 'Administrador não pode se auto-excluir.' });
        }
        await prisma.user.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar usuário.' });
    }
});


// --- ROTAS DE PRODUTOS (CRUD) ---
app.post('/products', async (req, res) => {
    const { name, quantity, category, ownerId } = req.body;
    if (!name || !quantity || !ownerId) {
        return res.status(400).json({ error: 'Nome, quantidade e ID do proprietário são obrigatórios.' });
    }
    try {
        const product = await prisma.product.create({
            data: { name, quantity: parseInt(quantity, 10), category, ownerId },
        });
        return res.status(201).json(product);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Não foi possível criar o produto.' });
    }
});

app.get('/users/:userId/products', async (req, res) => {
    const { userId } = req.params;
    try {
        const products = await prisma.product.findMany({
            where: { ownerId: userId },
            orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json(products);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Não foi possível listar os produtos.' });
    }
});

app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.product.delete({ where: { id } });
        return res.status(204).send();
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }
        console.error(error);
        return res.status(500).json({ error: 'Não foi possível deletar o produto.' });
    }
});


// --- ROTAS DE MOVIMENTAÇÃO DE ESTOQUE ---
app.post('/products/:productId/add-stock', async (req, res) => {
    const { productId } = req.params;
    const { quantity, reason } = req.body;
    const movementQuantity = parseInt(quantity, 10);
    if (!movementQuantity || movementQuantity <= 0) {
        return res.status(400).json({ error: 'A quantidade deve ser um número positivo.' });
    }
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
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao adicionar estoque.' });
    }
});

app.post('/products/:productId/remove-stock', async (req, res) => {
    const { productId } = req.params;
    const { quantity, reason } = req.body;
    const movementQuantity = parseInt(quantity, 10);
    if (!movementQuantity || movementQuantity <= 0) {
        return res.status(400).json({ error: 'A quantidade deve ser um número positivo.' });
    }
    try {
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product || product.quantity < movementQuantity) {
            return res.status(400).json({ error: 'Estoque insuficiente para esta saída.' });
        }
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
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao remover estoque.' });
    }
});

app.get('/products/:productId/history', async (req, res) => {
    const { productId } = req.params;
    try {
        const history = await prisma.stockMovement.findMany({
            where: { productId },
            orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json(history);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao buscar histórico do produto.' });
    }
});


// --- ROTA DE RELATÓRIOS ---
app.get('/reports/:userId/category-summary', async (req, res) => {
    const { userId } = req.params;
    try {
        const categorySummary = await prisma.product.groupBy({
            by: ['category'],
            where: { ownerId: userId },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
        });
        const formattedSummary = categorySummary.map(item => ({
            category: item.category || 'Não categorizado',
            totalQuantity: item._sum.quantity,
        }));
        return res.status(200).json(formattedSummary);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao gerar o relatório de categorias.' });
    }
});


app.listen(port, () => {
    console.log(`Servidor está rodando em http://localhost:${port}`);
});