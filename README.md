# 🗂️ Meu Portal CS OPS

Sistema web para gestão de demandas com Kanban, Dashboards, Formulários, Fluxogramas, Logs e Permissões.

---

## 🚀 Como rodar localmente

### Pré-requisitos
Você precisa ter instalado:
- **Node.js** (versão 18 ou superior) → https://nodejs.org
- **Git** → https://git-scm.com (opcional, para subir no GitHub)

---

### Passo 1 — Abra o terminal na pasta do projeto
No Windows: clique com botão direito dentro da pasta `meu-portal` → "Abrir no Terminal"
No Mac: arraste a pasta para o Terminal, ou use cd:

```bash
cd caminho/para/meu-portal
```

---

### Passo 2 — Instale as dependências

```bash
npm install
```

Aguarde terminar (pode levar 1-2 minutos na primeira vez).

---

### Passo 3 — Inicie o servidor de desenvolvimento

```bash
npm run dev
```

---

### Passo 4 — Abra no navegador

Acesse: **http://localhost:5173**

O projeto vai abrir automaticamente com a tela de login.
Clique em **"Acessar meu portal"** para entrar (login simulado).

---

## 📁 Estrutura do projeto

```
meu-portal/
├─ src/
│  ├─ App.jsx                    ← Componente principal + tela de login
│  ├─ main.jsx                   ← Ponto de entrada React
│  ├─ index.css                  ← Tailwind CSS
│  ├─ components/
│  │  ├─ ui/                     ← Botão, Card, Badge, TextInput, Tooltip
│  │  ├─ layout/                 ← Sidebar e TopBar
│  │  ├─ kanban/                 ← WorkView, TaskCard, CardModal
│  │  ├─ dashboard/              ← DashboardView, MetricCard, gráficos
│  │  ├─ form/                   ← Formulário de pedido + configurações
│  │  ├─ people/                 ← Gestão de pessoas e permissões
│  │  ├─ logs/                   ← Tabela de logs
│  │  ├─ flow/                   ← Fluxogramas com React Flow
│  │  └─ settings/               ← Configurações de perfil e tema
│  ├─ data/
│  │  └─ mockData.js             ← Todos os dados iniciais de exemplo
│  └─ utils/
│     ├─ permissions.js          ← Regras de visibilidade de cards
│     ├─ dates.js                ← Formatação e cálculo de datas
│     └─ logs.js                 ← Helper para criar entradas de log
├─ package.json
├─ vite.config.js
├─ tailwind.config.js
└─ postcss.config.js
```

---

## 🌐 Como subir no GitHub

### 1. Crie um repositório no GitHub
Acesse https://github.com/new e crie um repositório chamado `meu-portal` (sem inicializar com README).

### 2. No terminal, dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "Primeiro commit: Meu Portal de Trabalhos"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/meu-portal.git
git push -u origin main
```

Substitua `SEU_USUARIO` pelo seu usuário do GitHub.

---

## 🔧 Outros comandos úteis

| Comando | O que faz |
|---|---|
| `npm run dev` | Inicia o servidor local |
| `npm run build` | Gera versão final para publicar |
| `npm run preview` | Visualiza a versão final localmente |

---

## ✅ Funcionalidades implementadas

- [x] Tela de login (simulada)
- [x] Sidebar com navegação e espaços de trabalho
- [x] Kanban com fases personalizáveis, cards, mover, criar, editar
- [x] Dashboard com métricas, filtros, gráfico de pizza por setor e ranking
- [x] Formulário de pedido com validação e criação automática de card no Kanban
- [x] Configurações de setores e tipos de pedido
- [x] Gestão de pessoas com permissões por menu, card e ação
- [x] Logs de todas as ações importantes
- [x] Fluxogramas com React Flow (arrastar, conectar, adicionar blocos)
- [x] Configurações de perfil, foto, tema claro/escuro e segurança
- [x] Sistema de permissões: dono, editor, visualizador
- [x] Tooltip nos cards com solicitante, setor e prazo
- [x] Tag "Concluído" automática ao mover card para fase final
- [x] Busca em tempo real nos cards


## Supabase Auth

Esta versão já tem a primeira integração real com Supabase:

- Cadastro real com e-mail e senha
- Login real com e-mail e senha
- Login com Google/Gmail via Supabase Auth
- Logout real
- Uso das variáveis de ambiente da Vercel:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

No ambiente local, crie um arquivo `.env` na raiz do projeto usando o `.env.example` como base.

Na Vercel, cadastre as mesmas variáveis em Environment Variables e faça um novo deploy.
