# AgroStock - Aplicação (Front-end)

Interface de usuário para o sistema AgroStock, desenvolvida com React e Vite. A aplicação permite que os usuários interajam com a API do back-end para gerenciar seus estoques de forma visual e intuitiva.

## ✅ Funcionalidades

* **Login e Cadastro**: Telas para autenticação de usuários.
* **Dashboard de Estoque**: Visualização, adição e remoção de produtos, com filtros por categoria.
* **Histórico de Movimentação**: Modal para visualizar o histórico de entradas e saídas de cada produto.
* **Página de Relatórios**: Gráficos visuais (usando Recharts) para exibir dados como a quantidade de itens por categoria.
* **Painel de Administração**: Interface exclusiva para usuários `ADMIN` gerenciarem outros usuários no sistema.
* **Gerenciamento de Sessão**: Usa Context API para manter o estado do usuário logado e proteger rotas.

## 🛠️ Configuração do Ambiente

### Pré-requisitos

* [Node.js](https://nodejs.org/) (versão 18 ou superior)
* A [API do Back-end](#) deve estar rodando para que o front-end possa se comunicar com ela.

### Passos para Instalação

1.  **Acesse a pasta do projeto:**
    ```bash
    cd "Front-end"
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    * Crie um arquivo `.env` na raiz desta pasta (`Front-end`).
    * Adicione a URL da API do back-end:
        ```env
        # .env
        VITE_API_URL=http://localhost:3000
        ```

## 🚀 Executando a Aplicação

* **Para iniciar o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

A aplicação estará disponível em `http://localhost:5173` (ou outra porta indicada pelo Vite).

## 📂 Estrutura de Pastas

```
/src
├── /assets         # Ícones e imagens estáticas
├── /components     # Componentes reutilizáveis (Logo, Modal, Sidebar)
├── /constants      # Constantes globais (ex: categorias de produtos)
├── /contexts       # Context API (ex: AuthContext)
├── /layouts        # Estruturas de página (ex: DashboardLayout)
├── /pages          # Componentes de página (Login, Estoque, Admin)
├── /services       # Configuração do Axios (api.js)
├── main.jsx        # Ponto de entrada da aplicação
└── routes.jsx      # Configuração de rotas com React Router
```

## 📜 Scripts Disponíveis

* `npm run dev`: Inicia o servidor de desenvolvimento com Hot-Reload.
* `npm run build`: Compila a aplicação para produção.
* `npm run lint`: Executa o linter para verificar a qualidade do código.
* `npm run preview`: Inicia um servidor local para visualizar a build de produção.