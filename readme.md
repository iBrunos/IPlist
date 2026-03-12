# 🛡️ BIP — Blocklist Intelligence Platform

```
██████╗ ██╗██████╗ 
██╔══██╗██║██╔══██╗
██████╔╝██║██████╔╝
██╔══██╗██║██╔═══╝ 
██████╔╝██║██║     
╚═════╝ ╚═╝╚═╝     
Blocklist Intelligence Platform
```

Sistema centralizado de inteligência para blocklists corporativas. O BIP permite que equipes de segurança gerenciem, aprovem e publiquem listas de IPs, hashes e domínios maliciosos, com integração direta ao firewall via feeds públicos em texto puro.

---

## 🎯 O que é o BIP?

O BIP é uma plataforma web interna desenvolvida para centralizar o gerenciamento de indicadores de comprometimento (IOCs) utilizados em firewalls e soluções de segurança de rede. Com ele, é possível:

- Cadastrar e aprovar **IPs**, **hashes de arquivos** e **domínios** maliciosos
- Importar feeds externos de ameaças (Abuse.ch, URLhaus, etc.) automaticamente
- Gerar **feeds públicos em texto puro** consumíveis diretamente pelo firewall
- Controlar o acesso por **hierarquia de equipes e papéis** (técnico → líder → super admin)
- Auditar todas as ações realizadas na plataforma
- Visualizar estatísticas e atividade em tempo real no dashboard

---

## 🏗️ Arquitetura

```
frontend/          → Next.js 16 (React 19 + Tailwind CSS 4)
api/               → NestJS 11 (Prisma + PostgreSQL)
```

| Camada     | Tecnologia              | Porta  |
|------------|-------------------------|--------|
| Frontend   | Next.js 16              | 3001   |
| Backend    | NestJS 11               | 3000   |
| Banco      | PostgreSQL              | 5432   |

---

## 🔐 Hierarquia de Permissões

| Papel           | Criar | Aprovar       | Ver              |
|-----------------|-------|---------------|------------------|
| `tecnico`       | ✅    | ❌            | Apenas os seus   |
| `lidertecnico`  | ✅    | ✅ (equipe)   | Equipe           |
| `super_admin`   | ✅    | ✅ (todos)    | Tudo             |

Itens criados por **técnicos** entram com status `pending` e precisam de aprovação. Líderes e admins entram direto como `approved`.

**Equipes disponíveis:** `GESEG`, `GECON`, `GEDAT`, `TI`

---

## 🚀 Como rodar

### Pré-requisitos

- Node.js 20+
- PostgreSQL rodando
- Yarn

### 1. Banco de dados

Configure o `.env` na pasta `api/`:

```env
DATABASE_URL="postgresql://usr_bip:SENHA@HOST:5432/db_bip"
JWT_SECRET="sua-chave-secreta"
LDAP_URL=ldap://SEU_LDAP:389
LDAP_BASE_DN=DC=DOMINIO,DC=local
RADIUS_HOST=SEU_RADIUS
RADIUS_PORT=1812
RADIUS_SECRET=seu-secret
```

Rode as migrations:

```bash
cd api
npx prisma migrate dev
npx prisma db seed
```

### 2. Backend

```bash
cd api
yarn install
yarn start:dev
```

Backend disponível em: `http://localhost:3000`

### 3. Frontend

```bash
cd frontend
yarn install
yarn dev
```

Frontend disponível em: `http://localhost:3001`

---

## 📡 Feeds públicos (sem autenticação)

Os feeds são endpoints de texto puro consumíveis diretamente por firewalls e soluções de segurança:

| Tipo      | URL                                  |
|-----------|--------------------------------------|
| IPs       | `http://localhost:3001/feed/ips`     |
| Hashes    | `http://localhost:3001/feed/hashes`  |
| Domínios  | `http://localhost:3001/feed/domains` |

Formato: um item por linha, apenas registros com status `approved`.

---

## 📦 Módulos do Backend

| Módulo            | Descrição                                                  |
|-------------------|------------------------------------------------------------|
| `auth`            | Autenticação JWT + LDAP + RADIUS                          |
| `users`           | Gerenciamento de usuários com hierarquia                  |
| `ips`             | CRUD de IPs com aprovação, auditoria e paginação          |
| `hashes`          | CRUD de hashes (MD5/SHA1/SHA256/SHA512)                   |
| `domains`         | CRUD de domínios com validação e proteção                 |
| `feed`            | Geração dos feeds públicos em texto puro                  |
| `external-feeds`  | Feeds externos com sync automático por cron               |
| `audit`           | Log de auditoria de todas as ações                        |
| `dashboard`       | Estatísticas e gráficos com filtros de período            |

---

## 🖥️ Páginas do Frontend

| Rota                      | Descrição                                      |
|---------------------------|------------------------------------------------|
| `/login`                  | Autenticação                                   |
| `/dashboard`              | Painel com estatísticas e gráficos             |
| `/dashboard/ips`          | Gerenciamento de IPs                           |
| `/dashboard/hashes`       | Gerenciamento de hashes                        |
| `/dashboard/domains`      | Gerenciamento de domínios                      |
| `/dashboard/feeds`        | Feeds externos + importação de arquivos .txt   |
| `/dashboard/users`        | Gerenciamento de usuários                      |
| `/dashboard/audit`        | Log de auditoria                               |

---

## 📥 Importação de Feeds

O BIP suporta duas formas de importar dados externos:

**Via URL** — cadastre um feed com URL pública que será sincronizado automaticamente pelo cron (a cada hora). Suporta tipos `ip`, `hash`, `domain` ou `mixed` (auto-classifica cada linha).

**Via arquivo .txt** — faça upload de um arquivo ou cole o conteúdo diretamente. O sistema analisa e exibe um preview com a contagem de IPs, hashes e domínios antes de importar.

---

## 🔧 Dependências principais

### Backend (`api/`)

| Pacote                  | Uso                          |
|-------------------------|------------------------------|
| `@nestjs/core`          | Framework principal          |
| `@nestjs/jwt`           | Autenticação JWT             |
| `@nestjs/schedule`      | Cron jobs (sync de feeds)    |
| `@prisma/adapter-pg`    | ORM PostgreSQL               |
| `bcrypt`                | Hash de senhas               |
| `ldapts`                | Autenticação LDAP            |
| `node-radius-client`    | Autenticação RADIUS          |
| `multer`                | Upload de arquivos           |

### Frontend (`frontend/`)

| Pacote       | Uso                          |
|--------------|------------------------------|
| `next`       | Framework React SSR          |
| `axios`      | Requisições HTTP             |
| `recharts`   | Gráficos do dashboard        |
| `tailwindcss`| Estilização                  |

---

## 👤 Usuário padrão

Após o seed, o sistema cria um usuário administrador:

```
Usuário: admin
Senha:   admin
Papel:   super_admin
```

> ⚠️ Altere a senha após o primeiro acesso em produção.

---

## 📋 Scripts disponíveis

### Backend

```bash
yarn start          # Inicia em produção
yarn start:dev      # Inicia com hot-reload
yarn start:debug    # Inicia em modo debug
yarn build          # Compila para dist/
yarn test           # Executa testes unitários
yarn test:cov       # Executa testes com cobertura
```

### Frontend

```bash
yarn dev            # Inicia em desenvolvimento
yarn build          # Compila para produção
yarn start          # Inicia versão compilada
```

---

## 📁 Estrutura de pastas

```
BIP/
├── api/                          # Backend NestJS
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── auth/
│       ├── users/
│       ├── ips/
│       ├── hashes/
│       ├── domains/
│       ├── feed/
│       ├── external-feeds/
│       ├── audit/
│       ├── dashboard/
│       └── database/
└── frontend/                     # Frontend Next.js
    └── app/
        ├── (auth)/login/
        ├── dashboard/
        │   ├── ips/
        │   ├── hashes/
        │   ├── domains/
        │   ├── feeds/
        │   ├── users/
        │   └── audit/
        ├── feed/
        │   ├── ips/
        │   ├── hashes/
        │   └── domains/
        ├── lib/
        └── components/
```

---

*BIP — Blocklist Intelligence Platform · Uso interno · Confidencial*