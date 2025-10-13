# AgroStock 🌿

AgroStock é um sistema completo de gestão de estoque voltado para o setor agrícola. A plataforma permite que os usuários cadastrem, monitorem e gerenciem seus produtos agrícolas, com funcionalidades de controle de entrada e saída, relatórios por categoria e um painel administrativo para gerenciamento de usuários.

Este repositório é um **monorepo**, contendo tanto a API do back-end quanto a aplicação do front-end.

## 📂 Estrutura do Projeto

O projeto está dividido em duas pastas principais:

* **`/Api - Backend`**: O servidor, construído com Node.js, Express e Prisma, responsável por toda a lógica de negócio, autenticação e comunicação com o banco de dados MongoDB.
* **`/Front-end`**: A aplicação cliente, construída com React e Vite, que consome a API e fornece a interface para o usuário.

Para instruções detalhadas de como configurar e rodar cada parte, por favor, consulte os arquivos `README.md` dentro de cada pasta.

## ✨ Tecnologias Utilizadas

| Área       | Tecnologia                               |
| :--------- | :--------------------------------------- |
| **Backend** | Node.js, Express, Prisma, MongoDB, Bcrypt |
| **Frontend** | React, Vite, React Router, Axios, Recharts |
| **Geral** | Git, Monorepo                            |

## 🚀 Começando

Para rodar o projeto completo, você precisará iniciar o servidor do back-end e a aplicação do front-end separadamente, em dois terminais diferentes.

1.  **Configure e rode o Back-end:**
    * Siga as instruções no [README do Back-end](./Api%20-%20Backend/README.md).

2.  **Configure e rode o Front-end:**
    * Siga as instruções no [README do Front-end](./Front-end/README.md).

Após iniciar ambos, a aplicação estará acessível em `http://localhost:5173` (ou outra porta definida pelo Vite) e se comunicará com o servidor em `http://localhost:3000`.