# 📚 DOCUMENTAÇÃO ISACAR

> **Versão:** 1.3.1  
> **Última atualização:** Novembro 2025  
> **Plataforma:** Web Application (PWA)

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Propósito e Objetivos](#-propósito-e-objetivos)
3. [Público-Alvo](#-público-alvo)
4. [Stack Tecnológico](#-stack-tecnológico)
5. [Arquitetura do Sistema](#-arquitetura-do-sistema)
6. [Módulos Principais](#-módulos-principais)
7. [Funcionalidades Detalhadas](#-funcionalidades-detalhadas)
8. [Sistema de Workspaces](#-sistema-de-workspaces)
9. [Onboarding](#-onboarding)
10. [Configurações](#️-configurações)
11. [Integrações](#-integrações)
12. [Internacionalização](#-internacionalização)
13. [Segurança](#-segurança)
14. [Planos e Preços](#-planos-e-preços)

---

## 🎯 Visão Geral

O **ISACAR** é uma plataforma profissional de gestão empresarial all-in-one, projetada para unificar o gerenciamento de tarefas, finanças e projetos em uma única interface moderna e intuitiva.

### O que é o ISACAR?

ISACAR é um **SaaS (Software as a Service)** que combina:

- **Gestão de Tarefas** (estilo Notion/Todoist)
- **Controle Financeiro** (estilo Excel/Planilhas inteligentes)
- **Gerenciamento de Projetos** (estilo Trello/Linear)
- **Gerenciador de Orçamento** (metas e controle de gastos)
- **Analytics** (métricas e insights do Google Analytics)

Tudo isso em uma única plataforma com design moderno, responsivo e focado na experiência do usuário.

---

## 🎯 Propósito e Objetivos

### Missão

Simplificar a gestão de negócios e projetos pessoais através de uma plataforma unificada que elimina a necessidade de múltiplas ferramentas desconectadas.

### Objetivos Principais

| Objetivo | Descrição |
|----------|-----------|
| **Unificação** | Centralizar tarefas, finanças e projetos em um só lugar |
| **Simplicidade** | Interface intuitiva que não exige treinamento |
| **Colaboração** | Permitir trabalho em equipe em tempo real |
| **Flexibilidade** | Adaptar-se a diferentes tipos de negócios |
| **Acessibilidade** | Funcionar em qualquer dispositivo (desktop, tablet, mobile) |
| **Escalabilidade** | Crescer junto com o negócio do usuário |

### Problemas que Resolve

1. **Fragmentação de ferramentas** - Elimina a necessidade de usar 5-10 apps diferentes
2. **Perda de informações** - Centraliza todos os dados em um só lugar
3. **Falta de visibilidade** - Dashboard unificado com métricas importantes
4. **Complexidade financeira** - Controle financeiro simplificado e visual
5. **Colaboração difícil** - Workspaces compartilhados com permissões granulares

---

## 👥 Público-Alvo

### Perfis de Usuário

| Perfil | Descrição | Uso Principal |
|--------|-----------|---------------|
| **Freelancers** | Profissionais autônomos | Gestão de projetos e finanças pessoais |
| **Pequenas Empresas** | 1-20 funcionários | Colaboração e gestão financeira |
| **Startups** | Empresas em crescimento | Projetos, tarefas e métricas |
| **Gestores** | Líderes de equipe | Delegação e acompanhamento |
| **Estudantes** | Universitários e pós-graduandos | Organização pessoal e estudos |
| **Consultores** | Profissionais de consultoria | Gestão de clientes e projetos |

### Setores Atendidos

- Tecnologia e Software
- Marketing e Publicidade
- Consultoria Empresarial
- Educação
- Serviços Profissionais
- E-commerce
- Saúde e Bem-estar
- Construção e Arquitetura

---

## 🛠 Stack Tecnológico

### Frontend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **React** | 18.3.1 | Framework principal |
| **TypeScript** | 5.6.3 | Tipagem estática |
| **Vite** | 5.4.10 | Build tool e dev server |
| **Tailwind CSS** | 3.4.15 | Estilização utility-first |
| **Framer Motion** | 11.18.2 | Animações fluidas |
| **React Router** | 7.9.4 | Roteamento SPA |
| **Radix UI** | Latest | Componentes acessíveis |
| **shadcn/ui** | Latest | Sistema de design |
| **Lucide React** | 0.454.0 | Ícones |
| **Recharts** | 2.15.4 | Gráficos e visualizações |

### Backend

| Tecnologia | Propósito |
|------------|-----------|
| **Supabase** | Backend as a Service |
| **PostgreSQL** | Banco de dados relacional |
| **Supabase Auth** | Autenticação e autorização |
| **Supabase Storage** | Armazenamento de arquivos |
| **Supabase Realtime** | Sincronização em tempo real |

### Bibliotecas Adicionais

| Biblioteca | Propósito |
|------------|-----------|
| **@dnd-kit** | Drag and drop |
| **react-hook-form** | Gerenciamento de formulários |
| **Zod** | Validação de schemas |
| **date-fns** | Manipulação de datas |
| **jsPDF** | Geração de PDFs |
| **html2canvas** | Screenshots |
| **i18next** | Internacionalização |

### PWA (Progressive Web App)

- Funciona offline (com sincronização)
- Instalável como aplicativo
- Notificações push
- Atualização automática

---

## 🏗 Arquitetura do Sistema

### Estrutura de Diretórios

```
src/
├── components/          # Componentes React
│   ├── analytics/       # Métricas e dashboards
│   ├── docs/           # Sistema de documentos
│   ├── finance/        # Módulo financeiro
│   ├── gmail/          # Integração Gmail
│   ├── integrations/   # Integrações externas
│   ├── onboarding/     # Fluxo de onboarding
│   ├── projects/       # Gerenciamento de projetos
│   ├── recent/         # Atividades recentes
│   ├── tasks/          # Sistema de tarefas
│   ├── ui/             # Componentes base (shadcn)
│   └── workspace/      # Gerenciamento de workspaces
├── contexts/           # React Contexts
├── hooks/              # Custom hooks
├── lib/                # Utilitários e configurações
├── pages/              # Páginas da aplicação
├── services/           # Serviços de API
├── types/              # TypeScript types
└── utils/              # Funções auxiliares
```

### Padrões de Projeto

1. **Component-Based Architecture** - Componentes reutilizáveis e isolados
2. **Custom Hooks** - Lógica de negócio encapsulada
3. **Context API** - Estado global gerenciado
4. **Lazy Loading** - Carregamento sob demanda
5. **Code Splitting** - Bundles otimizados

### Fluxo de Dados

```
[Supabase] ←→ [Hooks] ←→ [Context] ←→ [Components] ←→ [UI]
     ↑                                        ↓
     └────────── Realtime Updates ←───────────┘
```

---

## 📦 Módulos Principais

### Navegação do Aplicativo

| Menu | Rota | Descrição |
|------|------|-----------|
| **Página Inicial** | `/dashboard` | Dashboard com cards arrastáveis |
| **Meu Trabalho** | `/meu-trabalho` | Gestão completa de tarefas |
| **Meus Projetos** | `/meus-projetos` | Gerenciamento de projetos Kanban |
| **Minha Finança** | `/minha-financa` | Controle financeiro com documentos |
| **Gerenciador** | `/meu-gerenciador` | Gerenciador de orçamento e metas |
| **Integrações** | `/settings/integrations` | Conectar serviços externos |
| **Analytics** | `/analytics/google` | Métricas do Google Analytics |

---

### 1. 📋 Módulo de Tarefas (Tasks)

**Caminho:** `/meu-trabalho`

O módulo de tarefas é um sistema completo de gerenciamento de atividades com recursos avançados.

#### Componentes Principais

| Componente | Descrição |
|------------|-----------|
| `tasks-card.tsx` | Card do dashboard com lista de tarefas |
| `task-modal.tsx` | Modal detalhado de tarefa |
| `task-detail-view.tsx` | Visualização completa da tarefa |
| `quick-add-task-dialog.tsx` | Adição rápida de tarefas |
| `task-row.tsx` | Linha de tarefa na lista |
| `notion-block-editor.tsx` | Editor de blocos estilo Notion |
| `time-tracker.tsx` | Rastreador de tempo |
| `task-activity-sidebar.tsx` | Comentários e atividades |

#### Funcionalidades

- **Criação rápida** de tarefas com atalhos de teclado
- **Prioridades** (Baixa, Média, Alta, Urgente)
- **Status** (Pendente, Em Progresso, Concluído, Cancelado)
- **Datas** de vencimento e lembretes
- **Subtarefas** aninhadas ilimitadas
- **Tags/Etiquetas** personalizáveis
- **Atribuição** para membros da equipe
- **Comentários** com @menções, emojis e anexos
- **Relacionamentos** entre tarefas
- **Time Tracking** com timer integrado
- **Editor de blocos** estilo Notion para descrições
- **Anexos** de arquivos (integração Google Drive)
- **Delegação** de tarefas entre membros
- **Favoritos** para acesso rápido

#### Visualizações

1. **Lista** - Tarefas em formato de lista ordenável
2. **Grupos** - Agrupamento por status/prioridade/data
3. **Expandida** - Modal full-screen com todas as funcionalidades
4. **Delegadas** - Tarefas delegadas a você ou por você

---

### 2. 💰 Módulo Financeiro (Finance)

**Caminho:** `/minha-financa`

Sistema completo de controle financeiro pessoal e empresarial.

#### Componentes Principais

| Componente | Descrição |
|------------|-----------|
| `finance-card.tsx` | Card do dashboard financeiro |
| `finance-page-view.tsx` | Página principal de finanças |
| `finance-viewer.tsx` | Visualizador de documentos financeiros |
| `budget-manager-page.tsx` | Gerenciador de orçamento |
| `transaction-table.tsx` | Tabela de transações |
| `categories-manager.tsx` | Gerenciador de categorias |
| `finance-charts.tsx` | Gráficos e visualizações |

#### Blocos Financeiros

| Bloco | Descrição |
|-------|-----------|
| `transaction-table` | Tabela de transações (receitas/despesas) |
| `recurring-bills` | Contas recorrentes e assinaturas |
| `category-summary` | Resumo por categoria |
| `goals-block` | Metas financeiras |
| `calendar-block` | Calendário de vencimentos |

#### Funcionalidades

- **Documentos financeiros** organizados por período/propósito
- **Transações** com categorização automática
- **Contas recorrentes** com lembretes
- **Metas financeiras** com progresso visual
- **Gráficos** interativos (pizza, barras, linhas)
- **Orçamento** por categoria
- **Filtros** avançados por data, categoria, tipo
- **Exportação** para PDF e Excel
- **Templates** pré-definidos (Pessoal, Freelancer, Empresa, etc.)
- **Blocos arrastáveis** estilo Notion
- **Modo offline** com sincronização

#### Templates Disponíveis

1. **Pessoal** - Controle de finanças pessoais
2. **Freelancer** - Para profissionais autônomos
3. **Empresa** - Gestão empresarial
4. **Estudante** - Orçamento estudantil
5. **Viagem** - Planejamento de viagens
6. **Casamento** - Organização de eventos
7. **Reforma** - Projetos de reforma

---

### 3. 📁 Módulo de Projetos (Projects)

**Caminho:** `/meus-projetos`

Gerenciamento visual de projetos com Kanban e integrações.

#### Componentes Principais

| Componente | Descrição |
|------------|-----------|
| `projects-card.tsx` | Card do dashboard de projetos |
| `project-manager.tsx` | Gerenciador completo de projetos |
| `kanban-card.tsx` | Card no board Kanban |
| `create-project-dialog.tsx` | Criação de projetos |
| `status-dialog.tsx` | Gerenciador de status |

#### Funcionalidades

- **Board Kanban** com drag & drop
- **Status customizáveis** por projeto
- **Datas** de início e término
- **Orçamento** vinculado ao projeto
- **Documentos** anexados
- **Membros** da equipe
- **Progresso** visual
- **Integração** com Google Drive
- **Compartilhamento** com links públicos
- **Exportação** de relatórios
- **Templates** de projetos

#### Status Padrão

1. Backlog
2. A Fazer
3. Em Progresso
4. Em Revisão
5. Concluído

---

### 4. 📊 Gerenciador de Orçamento (Budget Manager)

**Caminho:** `/meu-gerenciador`

Sistema completo de gerenciamento de orçamento e metas financeiras.

#### Componentes Principais

| Componente | Descrição |
|------------|-----------|
| `budget-manager-page.tsx` | Página completa do gerenciador |
| `budget-card.tsx` | Card do dashboard com gráfico pizza |
| `budget-tracker.tsx` | Rastreador de orçamento |
| `categories-manager.tsx` | Gerenciador de categorias |

#### Funcionalidades

- **Gráfico Pizza** interativo com distribuição financeira
- **Entradas/Gastos/Reservas** organizados visualmente
- **Metas financeiras** com progresso em tempo real
- **Categorias** personalizáveis
- **Painéis redimensionáveis** estilo Notion
- **Integração** com documentos financeiros
- **Comparativo** receitas vs despesas
- **Alertas** de orçamento excedido

---

### 5. 📊 Módulo Analytics

**Caminho:** `/analytics/google`

Integração com Google Analytics para métricas do site/aplicação.

#### Funcionalidades

- **Conexão** com conta Google Analytics
- **Visualização** de métricas em tempo real
- **Relatórios** personalizados
- **Gráficos** interativos
- **Filtros** por período

---

## 🔧 Funcionalidades Detalhadas

### Dashboard Principal

O dashboard é a página inicial após o login, apresentando:

1. **Cards Arrastáveis** - Reorganize os cards como preferir
2. **Card de Tarefas** - Resumo de tarefas pendentes
3. **Card Financeiro** - Saldo e últimas transações
4. **Card de Projetos** - Status dos projetos
5. **Card de Atividades** - Timeline de ações recentes
6. **Card de Orçamento** - Gráfico pizza de distribuição

### Busca Global

**Atalho:** `Ctrl/Cmd + K`

- Busca em todas as entidades
- Acesso rápido a comandos
- Navegação por teclado
- Resultados categorizados

### Atalhos de Teclado (Finance)

| Atalho | Ação |
|--------|------|
| `N` | Nova Transação |
| `S` | Buscar |
| `F` | Filtros |
| `G` | Gráficos |
| `E` | Exportar |
| `B` | Toggle Sidebar |

### Modo Offline

O ISACAR funciona offline com:

- Cache local de dados
- Fila de sincronização
- Indicador visual de status
- Sincronização automática ao reconectar

---

## 🏠 Sistema de Workspaces

### Conceito

Workspaces permitem separar dados pessoais de dados compartilhados/empresariais.

### Tipos de Workspace

| Tipo | Descrição |
|------|-----------|
| **Pessoal** | Dados privados do usuário (workspace_id = null) |
| **Colaborativo** | Dados compartilhados com equipe (workspace_id = UUID) |

### Funcionalidades

- **Troca rápida** entre workspaces
- **Convites** por email com link
- **Papéis** (Owner, Admin, Member)
- **Permissões** granulares
- **Configurações** por workspace
- **Logo/Avatar** personalizado

### Fluxo de Convite

1. Owner/Admin convida por email
2. Convite válido por 14 dias
3. Convidado recebe email com link
4. Aceita convite e entra no workspace
5. Herda permissões do papel atribuído

### Limites por Plano

| Plano | Membros |
|-------|---------|
| Free | 1 |
| Trial | 5 |
| Paid | 5 |
| Business | Ilimitado |

---

## 🚀 Onboarding

### Fluxo Completo (10 Passos)

| Passo | Nome | Descrição |
|-------|------|-----------|
| 1 | **Welcome** | Boas-vindas e apresentação |
| 2 | **Workspace** | Criação do espaço de trabalho |
| 3 | **Team Invite** | Convite de membros da equipe |
| 4 | **Pricing** | Seleção de plano |
| 5 | **User Type** | Tipo de uso (Pessoal/Trabalho/Educação) |
| 6 | **Goals** | Objetivos principais |
| 7 | **Experience** | Nível de experiência |
| 8 | **First Task** | Criação da primeira tarefa |
| 9 | **Management** | Introdução ao gerenciamento |
| 10 | **Budget** | Configuração financeira inicial |

### Características

- **Progressivo** - Cada passo prepara para o próximo
- **Educativo** - Ensina a usar a plataforma
- **Personalizável** - Adapta-se ao tipo de usuário
- **Skip-able** - Passos opcionais podem ser pulados
- **Persistente** - Retoma de onde parou

---

## ⚙️ Configurações

### Páginas de Configurações

| Página | Rota | Descrição |
|--------|------|-----------|
| **Perfil** | `/settings/profile` | Informações do usuário, foto, nome |
| **Notificações** | `/settings/notifications` | Preferências de notificação |
| **Preferências** | `/settings/preferences` | Tema, idioma, região |
| **Cobrança** | `/settings/billing` | Plano atual, limites, upgrade |
| **Integrações** | `/settings/integrations` | Conexão com serviços externos |

---

## 🔗 Integrações

### Google Integration

| Serviço | Funcionalidade |
|---------|----------------|
| **Google OAuth** | Login com conta Google |
| **Google Drive** | Anexar arquivos a projetos/tarefas |
| **Google Calendar** | Sincronizar eventos e lembretes |
| **Gmail** | Importar emails como tarefas |
| **Google Sheets** | Exportar dados financeiros |

### Configuração

1. Conectar conta Google em Configurações
2. Autorizar permissões solicitadas
3. Usar funcionalidades de integração

---

## 🌍 Internacionalização

### Idiomas Suportados

| Idioma | Código | Status |
|--------|--------|--------|
| Português (BR) | `pt-BR` | ✅ Completo |
| English | `en` | ✅ Completo |
| Español | `es` | ✅ Completo |

### Troca de Idioma

- Seletor no menu de configurações
- Persiste entre sessões
- Atualização imediata da UI

### Elementos Traduzidos

- Navegação e menus
- Formulários e botões
- Mensagens de erro/sucesso
- Tooltips e placeholders
- Datas e moedas (formatação local)

---

## 🔒 Segurança

### Autenticação

- **Email/Senha** com validação forte
- **OAuth** (Google)
- **Magic Link** (em desenvolvimento)
- **2FA** (em desenvolvimento)

### Autorização (RLS)

Row Level Security no Supabase garante:

- Usuários veem apenas seus dados
- Dados de workspace visíveis apenas para membros
- Operações respeitam permissões

### Políticas de Senha

- Mínimo 8 caracteres
- 1 letra maiúscula
- 1 letra minúscula
- 1 número
- 1 caractere especial

### Dados

- Criptografia em trânsito (HTTPS)
- Criptografia em repouso (Supabase)
- Backups automáticos
- Conformidade LGPD

---

## 💳 Planos e Preços

### Planos Disponíveis

| Plano | Preço Mensal | Preço Anual | Membros |
|-------|--------------|-------------|---------|
| **Grátis** | R$ 0 | R$ 0 | 1 |
| **Pro** | R$ 65 | R$ 624 | 5 |
| **Business** | R$ 197 | R$ 1.891 | Ilimitado |
| **Enterprise** | Personalizado | Personalizado | Ilimitado |

### Funcionalidades por Plano

| Funcionalidade | Grátis | Pro | Business | Enterprise |
|----------------|--------|-----|----------|------------|
| Tarefas ilimitadas | ✅ | ✅ | ✅ | ✅ |
| Documentos financeiros | 1 | 10 | Ilimitado | Ilimitado |
| Projetos | 3 | 20 | Ilimitado | Ilimitado |
| Armazenamento | 100MB | 5GB | 50GB | Ilimitado |
| Integrações | Básico | Completo | Completo | Customizado |
| Suporte | Email | Prioritário | Dedicado | 24/7 |
| SLA | - | - | 99.5% | 99.9% |
| On-premise | - | - | - | ✅ |

### Trial

- 14 dias de funcionalidades Pro
- Sem necessidade de cartão
- Downgrades automaticamente após período

---

## 📱 Responsividade

### Breakpoints

| Breakpoint | Largura | Dispositivo |
|------------|---------|-------------|
| `sm` | 640px | Mobile |
| `md` | 768px | Tablet |
| `lg` | 1024px | Laptop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Monitor grande |

### Adaptações

- **Mobile First** - Design começa pelo mobile
- **Touch Friendly** - Botões e áreas de toque adequados
- **Drawer/Sheets** - Modais adaptados para mobile
- **Bottom Navigation** - Navegação inferior em mobile
- **Collapsible Sidebars** - Sidebars que fecham em telas menores

---

## 🎨 Design System

### Cores

O ISACAR usa um sistema de cores baseado em CSS Variables que suporta modo claro e escuro.

### Componentes UI

Baseado no shadcn/ui com customizações:

- **Buttons** - Variants: default, destructive, outline, secondary, ghost, link
- **Cards** - Redimensionáveis e arrastáveis
- **Dialogs** - Modais responsivos
- **Tooltips** - Dicas de contexto
- **Dropdowns** - Menus suspensos
- **Inputs** - Formulários validados

### Animações

Framer Motion para:

- Transições de página
- Hover effects
- Loading states
- Micro-interações
- Drag & drop feedback

---

## 📞 Suporte e Contato

### Canais de Suporte

- **Email:** suporte@isacar.dev
- **Documentação:** docs.isacar.dev
- **Status:** status.isacar.dev

### Comunidade

- Roadmap público
- Feature requests
- Bug reports
- Changelog

---

## 🗺 Roadmap

### Em Desenvolvimento

- [ ] Aplicativo mobile nativo (iOS/Android)
- [ ] API pública
- [ ] Webhooks
- [ ] Zapier/Make integration
- [ ] Templates de equipe
- [ ] Relatórios avançados
- [ ] IA para categorização automática
- [ ] Chat interno

### Planejado

- [ ] Faturamento e NFe
- [ ] CRM básico
- [ ] Time tracking avançado
- [ ] Recursos de RH
- [ ] White-label

---

## 📄 Licença e Termos

- **Termos de Serviço:** /terms-of-service
- **Política de Privacidade:** /privacy-policy

---

## 🏆 Conclusão

O ISACAR é uma plataforma completa de gestão que unifica tarefas, finanças e projetos em uma única interface moderna e intuitiva. Com foco em simplicidade, colaboração e escalabilidade, atende desde freelancers até empresas em crescimento.

**Principais Diferenciais:**

1. ✅ Interface unificada all-in-one
2. ✅ Design moderno estilo Notion/Linear
3. ✅ Funciona offline (PWA)
4. ✅ Colaboração em tempo real
5. ✅ Integrações Google completas
6. ✅ Internacionalizado (PT/EN/ES)
7. ✅ Plano gratuito generoso
8. ✅ Sem curva de aprendizado

---

*Documentação gerada automaticamente em Novembro de 2025*
*© 2025 ISACAR - Todos os direitos reservados*
