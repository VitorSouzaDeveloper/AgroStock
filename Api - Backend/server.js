import express from 'express';
import cors from 'cors';
import pkg from './generated/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // Importado
import 'dotenv/config'; // Importado para carregar .env

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
                role: 'USER'
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

// --- Rota de Login (pública e gerando token JWT) ---
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

        // 1. Crie o payload do token
        const tokenPayload = { id: user.id, role: user.role };
        
        // 2. Gere o token JWT usando a chave secreta do .env
        const token = jwt.sign(
            tokenPayload, 
            process.env.JWT_SECRET, 
            { expiresIn: '8h' } // Token expira em 8 horas
        );
        
        const { senha: _, ...userWithoutPassword } = user;

        // 3. Retorne o token e os dados do usuário
        return res.status(200).json({ 
            user: userWithoutPassword,
            token: token 
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// --- MIDDLEWARE DE AUTENTICAÇÃO JWT ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

    if (token == null) {
        return res.status(401).json({ error: 'Acesso negado. Nenhum token fornecido.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, userPayload) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido ou expirado.' });
        }
        req.user = userPayload; // Adiciona o payload (id, role) à requisição
        next();
    });
};

// --- MIDDLEWARE DE VERIFICAÇÃO DE ADMIN ---
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        return res.status(403).json({ error: 'Acesso proibido. Requer privilégios de administrador.' });
    }
};

// --- ROTAS DE ADMINISTRAÇÃO (protegidas com authenticateToken e isAdmin) ---
app.get('/admin/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, idade: true }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuários.' });
    }
});

app.put('/admin/users/:id/role', authenticateToken, isAdmin, async (req, res) => {
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

app.delete('/admin/users/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        // Validação segura para evitar auto-exclusão
        if (req.user.id === id) {
            return res.status(400).json({ error: 'Administrador não pode se auto-excluir.' });
        }
        await prisma.user.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar usuário.' });
    }
});

// --- ROTAS DE PRODUTOS (protegidas com authenticateToken) ---
app.post('/products', authenticateToken, async (req, res) => {
    const { name, quantity, category, ownerId } = req.body;
    // Garante que o produto seja criado para o usuário autenticado
    if (req.user.id !== ownerId) {
        return res.status(403).json({ error: "Não é permitido criar produtos para outro usuário." });
    }
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

app.get('/users/:userId/products', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    // Garante que um usuário só possa ver seus próprios produtos (a menos que seja admin)
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Acesso não autorizado para ver estes produtos.' });
    }
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

app.delete('/products/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        // Opcional: Adicionar verificação se o produto pertence ao usuário
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

// --- ROTAS DE MOVIMENTAÇÃO DE ESTOQUE (protegidas) ---
app.post('/products/:productId/add-stock', authenticateToken, async (req, res) => {
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

app.post('/products/:productId/remove-stock', authenticateToken, async (req, res) => {
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

app.get('/products/:productId/history', authenticateToken, async (req, res) => {
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

// --- ROTA DE RELATÓRIOS (protegida) ---
app.get('/reports/:userId/category-summary', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Acesso não autorizado para ver estes relatórios.' });
    }
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