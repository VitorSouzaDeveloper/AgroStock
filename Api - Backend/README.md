# Api

API Node.js usando Express e Prisma (MongoDB).

Pré-requisitos
- Node.js 18+ (ou versão compatível)
- MongoDB (URI colocada em `.env`)

Instalação

1. Instale dependências:

```powershell
npm install
```

2. Copie `.env` e defina `DATABASE_URL` (exemplo já no repositório local):

```
DATABASE_URL="mongodb+srv://USER:PASSWORD@cluster.../Users?retryWrites=true&w=majority"
```

3. Inicie o servidor:

```powershell
node server.js
```

Observações
- Não comite arquivos sensíveis como `.env`.
- Se usar Prisma localmente, rode `npx prisma generate` caso precise regenerar o cliente.

## Publish to GitHub

Quick steps to publish this project to a new GitHub repository (PowerShell):

```powershell
cd path\to\Api
git init
git add .
git commit -m "Initial commit"
# create repo on GitHub web UI or use GitHub CLI: gh repo create <your-username>/api --public --source . --remote origin
git remote add origin https://github.com/<your-username>/api.git
git branch -M main
git push -u origin main
```

Replace `<your-username>` and repository name as needed.
