# ISACAR - Documentação para TestSprite

## Visão Geral do Projeto

ISACAR é uma plataforma profissional de gestão de projetos, tarefas, documentos e finanças. A aplicação é construída com React, TypeScript, Vite, Supabase e Radix UI.

## Configuração Técnica

- **Framework**: React 18.3.1 + TypeScript
- **Build Tool**: Vite 5.4.10
- **Servidor de Desenvolvimento**: Porta 3005 (http://localhost:3005)
- **Roteamento**: React Router DOM 7.9.4
- **UI Components**: Radix UI
- **Banco de Dados**: Supabase (PostgreSQL)
- **Estilização**: Tailwind CSS
- **i18n**: react-i18next

## Estrutura Principal

### Rotas Principais
- `/` - Dashboard principal
- `/auth` - Autenticação
- `/dashboard` - Dashboard com projetos e tarefas
- `/finance` - Módulo financeiro
- `/tasks` - Gerenciamento de tarefas
- `/settings/*` - Configurações

### Componentes Principais Testados

#### RecurringBillsBlock (`src/components/finance/blocks/recurring-bills-block.tsx`)
Componente crítico para gerenciar contas recorrentes com:
- Tabela interativa com edição inline
- Calendário moderno para seleção de data de vencimento
- Adicionar/remover contas recorrentes
- Toggle de status pago/não pago
- Seleção de categoria
- Validação de valores (amount > 0)
- Prevenção de recarregamento de página

**Funcionalidades**:
- Adicionar nova conta recorrente
- Editar nome, valor, dia de vencimento, categoria inline
- Marcar/desmarcar como pago
- Deletar conta recorrente
- Carregamento de dados do Supabase
- Feedback visual durante operações assíncronas

**Elementos de Teste**:
- `data-testid="recurring-bills-block"` - Container principal
- `data-testid="add-bill-button"` - Botão para adicionar nova conta
- `data-testid="bill-row-{id}"` - Linha da tabela
- `data-testid="edit-{field}-{id}"` - Campos editáveis
- `data-testid="calendar-trigger-{id}"` - Trigger do calendário
- `data-testid="delete-bill-{id}"` - Botão de deletar

## Fluxo de Autenticação

A aplicação usa autenticação via Supabase. Para testes:
1. Acessar `/auth`
2. Realizar login ou criar conta
3. Após autenticação, redireciona para dashboard

## Banco de Dados

### Tabela: recurring_bills
- `id` (uuid, primary key)
- `workspace_id` (uuid, foreign key)
- `name` (text, not null)
- `amount` (numeric, check constraint: amount > 0)
- `due_day` (integer, 1-31)
- `category` (text)
- `paid` (boolean, default false)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Comandos de Desenvolvimento

```bash
npm run dev        # Inicia servidor na porta 3005
npm run build      # Build de produção
npm run preview    # Preview do build
```

## Notas Importantes para Testes

1. **Visibilidade do Componente**: O `RecurringBillsBlock` está configurado como `defaultVisible: true` em `finance-blocks-registry.ts`
2. **Prevenção de Reload**: Todos os handlers têm `e.preventDefault()` e `e.stopPropagation()`
3. **Validações**: 
   - Nome não pode ser vazio
   - Valor deve ser > 0 (mínimo 0.01)
   - Dia de vencimento deve estar entre 1-31
4. **Feedback Visual**: Spinners aparecem durante operações assíncronas (saving, deleting, adding)
5. **Mobile**: Calendário e tabela são responsivos

## Variáveis de Ambiente Necessárias

- `VITE_SUPABASE_URL` - URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY` - Chave anônima do Supabase

## Tipos de Teste Recomendados

1. **Testes de Renderização**: Verificar se componentes renderizam corretamente
2. **Testes de Interação**: Clicar, editar, selecionar
3. **Testes de Formulário**: Preenchimento e validação de campos
4. **Testes de Navegação**: Rotas e redirecionamentos
5. **Testes de Integração**: Interações com Supabase
6. **Testes de Responsividade**: Layout mobile/desktop

