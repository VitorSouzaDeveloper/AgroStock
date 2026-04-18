# AgroStock 🌿

AgroStock é um sistema completo de gestão de estoque voltado para o setor agrícola. A plataforma permite que os usuários cadastrem, monitorem e gerenciem seus produtos agrícolas, com funcionalidades de controle de entrada e saída, relatórios por categoria e um painel administrativo para gerenciamento de usuários.

Este repositório é um **monorepo**, contendo tanto a API do back-end quanto a aplicação do front-end.

---

## 📂 Estrutura do Projeto

```
/
├── backend/          → API REST (Node.js + Express + Prisma + MongoDB)
└── Front-end/        → Aplicação cliente (React + Vite)
```

Para instruções detalhadas de como configurar e rodar cada parte, consulte os arquivos `README.md` dentro de cada pasta.

---

## ✨ Tecnologias Utilizadas

| Área | Tecnologia |
| :--- | :--- |
| **Backend** | Node.js, Express, Prisma, MongoDB, Bcrypt, JWT |
| **Frontend** | React, Vite, React Router, Axios, Recharts |
| **Mobile** | Capacitor (scanner de código de barras) |
| **Geral** | Git, Monorepo |

---

## 🚀 Começando

Para rodar o projeto completo, inicie o back-end e o front-end em dois terminais separados.

**1. Back-end:**
```bash
cd backend
npm install
npm start
```
> Consulte [README do Back-end](./backend/README.md) para configurar as variáveis de ambiente.

**2. Front-end:**
```bash
cd Front-end
npm install
npm run dev
```
> Consulte [README do Front-end](./Front-end/README.md) para detalhes.

Após iniciar ambos, acesse `http://localhost:5173` (Vite) — a API será servida em `http://localhost:3000`.

---

## 🆕 Últimas Atualizações (UI)

- **Modal responsivo**: formulário de produto agora funciona sem scroll no desktop e com scroll interno no mobile
- **Layout de 3 colunas**: cards de produto exibidos em 3 colunas na web, 1 coluna no mobile
- **Formulário compacto no desktop**: campos "Código de Barras" e "Validade" agora ficam na mesma linha; espaçamentos otimizados via `@media (min-width: 769px)` sem afetar o mobile
- **Grid responsivo**: todas as alterações de layout são isoladas por breakpoints CSS, preservando a experiência mobile

---

## 📋 Funcionalidades Principais

- ✅ Cadastro, edição e exclusão de produtos
- ✅ Controle de entrada e saída de estoque
- ✅ Alertas de estoque baixo e produtos vencidos/próximos do vencimento
- ✅ Histórico de movimentações por produto
- ✅ Filtragem por categoria e pesquisa por nome/código de barras
- ✅ Scanner de código de barras (via Capacitor — apenas mobile)
- ✅ Relatórios por categoria
- ✅ Painel administrativo de usuários
- ✅ Autenticação com JWT