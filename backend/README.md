# AgroStock - API (Back-end)

Esta é a API do sistema AgroStock, responsável pela lógica de negócio, gerenciamento de dados e autenticação. Construída com Node.js, Express e Prisma ORM para MongoDB.

## ✅ Funcionalidades

* **Autenticação**: Cadastro (`/users`) e Login (`/login`) de usuários com senhas criptografadas (bcrypt).
* **Gerenciamento de Produtos**: CRUD completo para produtos, associados a um usuário.
* **Controle de Estoque**: Rotas para registrar entradas e saídas de estoque, mantendo um histórico detalhado por produto.
* **Relatórios**: Geração de dados agregados, como a quantidade de itens por categoria para um usuário.
* **Painel de Admin**: Rotas protegidas para administradores visualizarem, promoverem e deletarem usuários.

## 🛠️ Configuração do Ambiente

### Pré-requisitos

* [Node.js](https://nodejs.org/) (versão 18 ou superior)
* [MongoDB](https://www.mongodb.com/): Uma instância do MongoDB rodando (localmente ou um serviço como o MongoDB Atlas).

### Passos para Instalação

1.  **Clone o repositório e acesse a pasta:**
    ```bash
    cd "Api - Backend"
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    * Crie um arquivo `.env` na raiz desta pasta (`Api - Backend`).
    * Adicione a sua connection string do MongoDB, como no exemplo abaixo:
        ```env
        # .env
        DATABASE_URL="mongodb+srv://<USER>:<PASSWORD>@<CLUSTER_URL>/<DATABASE_NAME>?retryWrites=true&w=majority"
        ```

4.  **Gere o cliente do Prisma:**
    * O Prisma precisa gerar um cliente customizado baseado no seu schema.
    ```bash
    npx prisma generate
    ```

## 🚀 Executando a Aplicação

* **Para desenvolvimento (com auto-reload):**
    ```bash
    npm run dev
    ```

* **Para produção:**
    ```bash
    npm start
    ```

O servidor estará rodando em `http://localhost:3000`.

## 📦 Modelos de Dados (`schema.prisma`)

* **`User`**: Armazena informações dos usuários (nome, email, senha, role).
* **`Product`**: Representa um item no estoque, com nome, quantidade e categoria. Possui uma relação obrigatória com um `User` (dono).
* **`StockMovement`**: Registra cada entrada ou saída de um `Product`, incluindo tipo, quantidade e data.