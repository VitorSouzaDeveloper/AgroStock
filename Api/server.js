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
app.post('/users', async (req, res) => {
    const body = req.body;
    if (!body) return res.status(400).json({ error: 'O corpo da requisição é obrigatório.' });

    const { name, email, idade, senha } = body;
    if (!name || !email || !senha) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes: name, email, senha.' });
    }

    try {
        const hashedSenha = await bcrypt.hash(senha, 10);
        const user = await prisma.user.create({
            data: { name, email, idade, senha: hashedSenha },
        });
        return res.status(201).json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
})

app.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        return res.status(200).json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
})

app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, idade, senha } = req.body;
    try {
        const updateData = { name, email, idade };
        if (senha) {
            updateData.senha = await bcrypt.hash(senha, 10);
        }
        const updatedUser = await prisma.user.update({
            where: { id: id },
            data: updateData,
        });
        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Este e-mail já está em uso.' });
        }
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
})

app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({ where: { id } });
        return res.status(204).json({ mensagem: 'Usuário deletado com sucesso.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
})

app.listen(port, () => {
    console.log(`Servidor está rodando em http://localhost:${port}`);
});
