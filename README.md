# ChegueiApp — Sistema de Retirada Escolar

Monorepo com:
- **Backend** — NestJS + PostgreSQL + Socket.io
- **Web** — React + Vite + TailwindCSS (Painel TV + Admin)
- **Mobile** — Expo + React Native (App para responsáveis)

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Node.js | 20+ |
| npm | 9+ |
| Docker + Docker Compose | qualquer versão recente |
| Expo CLI (mobile) | `npm i -g expo-cli` |

---

## Opção 1 — Subir tudo com Docker (recomendado)

```bash
# 1. Clone / entre no diretório
cd cheguei

# 2. Suba PostgreSQL + Backend + Web
docker-compose up -d

# 3. Rode o seed (dados iniciais)
docker-compose exec backend npm run seed

# 4. Acesse:
#   Web Admin:  http://localhost:5173
#   Backend API: http://localhost:3001
```

---

## Opção 2 — Rodar localmente sem Docker

### 1. Suba somente o banco (PostgreSQL)

```bash
docker-compose up -d postgres
```

Ou instale o PostgreSQL localmente e crie o banco:

```sql
CREATE USER cheguei WITH PASSWORD 'cheguei123';
CREATE DATABASE cheguei OWNER cheguei;
```

---

### 2. Backend (NestJS)

```bash
cd packages/backend

# Instale dependências
npm install

# Configure o .env (já existe com valores padrão para dev local)
# DATABASE_URL=postgresql://cheguei:cheguei123@localhost:5432/cheguei
# JWT_SECRET=cheguei-local-secret-key-change-in-prod
# PORT=3001

# Inicie o servidor
npm run dev
# → http://localhost:3001

# Em outro terminal, popule o banco com dados de teste
npm run seed
```

---

### 3. Web (React)

```bash
cd packages/web

# Instale dependências
npm install

# Inicie
npm run dev
# → http://localhost:5173
```

---

### 4. Mobile (Expo)

```bash
cd packages/mobile

# Instale dependências
npm install

# Configure o IP do seu computador no .env para dispositivo físico:
# EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3001
# (Em emulador Android use: http://10.0.2.2:3001)
# (Em emulador iOS use: http://localhost:3001)

# Inicie
npm start
# Escaneie o QR Code com o app Expo Go ou rode no emulador
```

---

## Usuários de teste (após o seed)

| Perfil | Email | Senha | Acesso |
|---|---|---|---|
| Admin | `admin@cheguei.com` | `admin123` | Painel Admin + TV |
| Recepção | `recepcao@cheguei.com` | `recepcao123` | Painel TV |
| Responsável 1 | `ana@example.com` | `123456` | App Mobile (filhos: Gustavo, Larissa) |
| Responsável 2 | `carlos@example.com` | `123456` | App Mobile (filho: Pedro) |
| Responsável 3 | `maria@example.com` | `123456` | App Mobile (filhos: Beatriz, Rafael) |

---

## Fluxo de demonstração

1. **Abra o Painel TV** → `http://localhost:5173/painel` com a conta `recepcao@cheguei.com`
2. **No mobile**, faça login com `ana@example.com` e clique em **Cheguei!** para Gustavo Eloy
3. O painel TV atualiza em **tempo real** via WebSocket e **fala o nome** do aluno
4. Na recepção, clique em **Entregue** para fechar o check-in
5. O responsável pode clicar novamente após o cooldown configurado (padrão: 40s)

---

## Estrutura do projeto

```
cheguei/
├── packages/
│   ├── backend/          # NestJS API (porta 3001)
│   │   └── src/
│   │       ├── auth/     # JWT auth
│   │       ├── tenants/  # Multi-tenant
│   │       ├── users/    # Usuários
│   │       ├── alunos/   # Alunos + fotos
│   │       ├── checkin/  # Check-ins + expiração automática
│   │       ├── media/    # Mídias do painel
│   │       └── websocket/ # Socket.io gateway
│   ├── web/              # React (porta 5173)
│   │   └── src/
│   │       ├── pages/Login.tsx
│   │       ├── pages/Panel.tsx     # Painel TV
│   │       └── pages/Admin/        # Painel administrativo
│   └── mobile/           # Expo React Native
│       └── app/
│           ├── (auth)/login.tsx
│           └── (app)/index.tsx     # Home + Cheguei button
├── docker-compose.yml
└── .env.example
```

---

## Funcionalidades implementadas

### Backend
- [x] Auth com JWT (sem AWS Cognito em dev local)
- [x] Multi-tenant com isolamento por `tenantId`
- [x] CRUD de alunos com upload de foto
- [x] CRUD de usuários (ADMIN, RECEPCAO, RESPONSAVEL)
- [x] Check-in com expiração automática (CRON a cada minuto)
- [x] Rechamada com cooldown configurável por tenant
- [x] Mídias com agendamento (dias da semana, horário, expiração)
- [x] WebSocket (Socket.io) para eventos em tempo real
- [x] Serve uploads locais em `/uploads`

### Web (Painel TV + Admin)
- [x] Login para ADMIN e RECEPCAO
- [x] Painel TV com aluno em destaque + fila de espera
- [x] Slideshow de mídias (imagens com timer, vídeos com duração natural)
- [x] Fala o nome do aluno via Web Speech API
- [x] Botão "Entregue" para fechar check-in
- [x] Painel Admin: Alunos, Usuários, Mídias, Configurações
- [x] Configuração de tema (cores, logo, fonte) por tenant

### Mobile (App do Responsável)
- [x] Login com email/senha
- [x] Lista de filhos vinculados
- [x] Botão **Cheguei!** por filho
- [x] Contador de cooldown para rechamada
- [x] Atualização de status via WebSocket

---

## Customização de tema

Acesse **Admin → Configurações** para personalizar:
- Logo da escola
- Cores primária, secundária e de destaque
- Fonte
- Tempo de expiração do check-in
- Cooldown para rechamada
- Duração padrão de transição de imagens

---

## API — Endpoints principais

```
POST   /auth/login
GET    /auth/me

GET    /tenants/me
PATCH  /tenants/me
POST   /tenants/me/logo

GET    /users
POST   /users
PATCH  /users/:id
DELETE /users/:id

GET    /alunos
POST   /alunos
POST   /alunos/:id/foto
POST   /alunos/:id/responsaveis/:responsavelId

GET    /checkin/ativos
GET    /checkin/meus
POST   /checkin { alunoId }
POST   /checkin/:id/rechamar
PATCH  /checkin/:id/status { status: "ENTREGUE" }

GET    /media/ativas
POST   /media/upload (multipart)
PATCH  /media/:id
DELETE /media/:id
```

---

## WebSocket — Eventos

```
novo_checkin      → novo check-in criado (painel atualiza + fala o nome)
rechamada         → responsável chamou novamente (painel fala o nome)
status_atualizado → status do check-in mudou
checkin_expirado  → check-in expirou automaticamente
```
