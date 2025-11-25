# 🎯 INTEGRAÇÃO COMPLETA - SISTEMA DE ORÇAMENTO

## 📋 VISÃO GERAL

O sistema de orçamento do ISACAR tem **3 componentes principais** que devem estar **100% integrados**:

### **1. Budget Step (Onboarding - Passo 11)** 📝
- **Objetivo**: Criar orçamento inicial do usuário
- **Dados salvos**: Entradas, Gastos, Reservas, Metas
- **Tabela**: `finance_documents` + `finance_transactions`

### **2. Card/Página "Gerenciador de Orçamentos"** 📊
- **Objetivo**: Visualizar e gerenciar orçamento
- **Fonte de dados**: `finance_documents.template_config`
- **Exibe**: Gráfico pizza + tabelas de entradas/gastos/reservas/metas

### **3. Card Finance + Página "Minha Finança"** 💰
- **Objetivo**: Documentos financeiros com blocos avançados
- **Fonte de dados**: `finance_documents` + `finance_transactions`
- **Exibe**: Tabela de transações + blocos customizáveis

---

## 🔄 FLUXO DE DADOS

```
┌─────────────────────────────────────────────────────────────┐
│                    ONBOARDING (Passo 11)                    │
│                                                             │
│  Usuário preenche:                                          │
│  ✓ Entrada (Salário)                                        │
│  ✓ Gasto (Aluguel)                                          │
│  ✓ Reserva (Emergência)                                     │
│  ✓ Meta (Economizar)                                        │
│                                                             │
│  Clica "Continuar" →                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (Backend)                       │
│                                                             │
│  1. Cria finance_document:                                  │
│     - name: "Orçamento Onboarding"                          │
│     - workspace_id: [workspace do usuário]                  │
│     - user_id: [id do usuário]                              │
│     - template_config: {                                    │
│         incomes: [{ name, value, date }],                   │
│         reserves: [{ name, type, value, date }],            │
│         metas: [{ name, type, value, month, year }]         │
│       }                                                     │
│                                                             │
│  2. Cria finance_transaction (se houver gasto):             │
│     - type: 'expense'                                       │
│     - category: [categoria do gasto]                        │
│     - amount: [valor]                                       │
│     - finance_document_id: [id do documento criado]         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  DASHBOARD (Cards)                          │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  Card Finance        │  │  Card Gerenciador    │        │
│  │                      │  │                      │        │
│  │  Busca:              │  │  Busca:              │        │
│  │  finance_documents   │  │  finance_documents   │        │
│  │  WHERE user_id = X   │  │  WHERE user_id = X   │        │
│  │  AND workspace_id=Y  │  │  AND workspace_id=Y  │        │
│  │                      │  │                      │        │
│  │  Exibe:              │  │  Exibe:              │        │
│  │  - Total entrada     │  │  - Gráfico pizza     │        │
│  │  - Total gastos      │  │  - Entradas          │        │
│  │  - Saldo             │  │  - Gastos            │        │
│  └──────────────────────┘  │  - Reservas          │        │
│                            │  - Metas             │        │
│                            └──────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              PÁGINAS (Minha Finança / Meu Gerenciador)      │
│                                                             │
│  Mesmas queries dos cards, mas com mais detalhes:           │
│  - Tabela completa de transações                            │
│  - Blocos customizáveis (Minha Finança)                     │
│  - Edição inline de valores (Meu Gerenciador)               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 DIAGNÓSTICO - PASSO A PASSO

### **PASSO 1: Verificar se dados foram salvos**

Execute no Supabase via MCP:
```sql
-- Ver arquivo: DIAGNOSTICO_BUDGET_INTEGRATION.sql
```

**Resultado esperado:**
- ✅ Pelo menos 1 documento "Orçamento Onboarding"
- ✅ `template_config` com arrays: `incomes`, `reserves`, `metas`
- ✅ `workspace_id` e `user_id` preenchidos
- ✅ Transações do tipo `expense` associadas

---

### **PASSO 2: Verificar queries dos componentes**

#### **BudgetCard (Dashboard)**
```typescript
// Linha 191-200 de budget-card.tsx
supabase
  .from('finance_documents')
  .select('id, total_income, total_expenses, template_config')
  .eq('user_id', user.id)
  .eq('workspace_id', currentWorkspace.id) // ← IMPORTANTE!
```

**Problema comum:**
- ❌ Se `currentWorkspace` for `null`, não retorna nada
- ❌ Se documento foi criado com `workspace_id` diferente

**Solução:**
```typescript
// Buscar TODOS os documentos do usuário primeiro
.eq('user_id', user.id)
// Depois filtrar por workspace se existir
```

---

#### **FinanceCard (Dashboard)**
```typescript
// use-finance-card.ts
supabase
  .from('finance_documents')
  .select('*')
  .eq('user_id', user.id)
  .eq('workspace_id', workspaceId)
```

**Mesmo problema!**

---

### **PASSO 3: Testar com dados populados**

Se você quiser testar rapidamente SEM refazer onboarding:
```sql
-- Ver arquivo: POPULAR_DADOS_TESTE_BUDGET.sql
```

Isso cria:
- 1 documento financeiro completo
- 6 transações (4 gastos + 2 entradas)
- template_config com incomes, reserves, metas

---

## 🐛 PROBLEMAS COMUNS E SOLUÇÕES

### **1. "Dados aparecem em Atividades Recentes mas não nos cards"**

**Causa:** Query dos cards está filtrando demais (workspace_id incorreto)

**Solução:**
```typescript
// ANTES (muito restritivo)
.eq('workspace_id', currentWorkspace.id)

// DEPOIS (mais flexível)
if (currentWorkspace?.id) {
  query = query.eq('workspace_id', currentWorkspace.id)
}
// Ou buscar TODOS do usuário e filtrar no frontend
```

---

### **2. "Card mostra 0 em tudo"**

**Causa:** `template_config` está vazio ou mal formatado

**Verificar:**
```sql
SELECT 
  id,
  name,
  jsonb_pretty(template_config) as config
FROM finance_documents
WHERE user_id = 'SEU_USER_ID'
ORDER BY created_at DESC
LIMIT 1;
```

**Deve retornar:**
```json
{
  "incomes": [
    { "id": "1", "name": "Salário", "value": 5000, "date": "2024-11-18" }
  ],
  "reserves": [
    { "id": "1", "name": "Emergência", "type": "emergency", "value": 1000, "date": "2024-11-18" }
  ],
  "metas": [
    { "id": "1", "name": "Economizar", "type": "savings", "value": 3000, "month": 11, "year": 2024 }
  ]
}
```

---

### **3. "Gráfico não aparece no Gerenciador"**

**Causa:** Dados não estão sendo agregados corretamente

**Verificar em budget-card.tsx (linha 215-224):**
```typescript
documents.forEach(doc => {
  const config = doc.template_config || {}
  const incomes = config.incomes || []  // ← Deve ser array
  const reserves = config.reserves || [] // ← Deve ser array
  const metas = config.metas || []       // ← Deve ser array
  
  totalIncome += incomes.reduce((sum, i) => sum + (i.value || 0), 0)
  // ...
})
```

**Se `config.incomes` não for array, dá erro!**

---

## ✅ CHECKLIST DE INTEGRAÇÃO

### **Backend (Supabase)**
- [ ] Tabela `finance_documents` existe
- [ ] Tabela `finance_transactions` existe
- [ ] RLS policies permitem INSERT/SELECT para user_id
- [ ] Documento criado tem `workspace_id` e `user_id`
- [ ] `template_config` é JSONB válido com arrays

### **Onboarding (Budget Step)**
- [ ] Salva `workspace_id` do usuário
- [ ] Salva `user_id` do usuário
- [ ] Cria `template_config` com estrutura correta
- [ ] Cria transação se houver gasto
- [ ] Toast de sucesso aparece

### **Cards (Dashboard)**
- [ ] BudgetCard busca por `user_id` + `workspace_id`
- [ ] FinanceCard busca por `user_id` + `workspace_id`
- [ ] Listener `finance-transaction-updated` funciona
- [ ] Skeleton aparece durante loading
- [ ] Dados aparecem após carregar

### **Páginas**
- [ ] Minha Finança mostra documentos
- [ ] Meu Gerenciador mostra gráfico
- [ ] Tabela de transações funciona
- [ ] Edição inline salva corretamente

---

## 🚀 PRÓXIMOS PASSOS

1. **Execute DIAGNOSTICO_BUDGET_INTEGRATION.sql** no Supabase
2. **Verifique se dados existem** no banco
3. **Se não existir:** Execute POPULAR_DADOS_TESTE_BUDGET.sql
4. **Se existir mas não aparecer:** Problema é na query do frontend
5. **Abra console do navegador** e veja logs:
   ```
   🔍 [useFinanceCard] Buscando documentos...
   ✅ [useFinanceCard] Documentos encontrados: X
   🔔 [BudgetCard] Transação atualizada, recarregando...
   ```

---

## 📞 SUPORTE

Se após executar os SQLs os dados **existirem no banco** mas **não aparecerem no frontend**, o problema está em:

1. **Query incorreta** (workspace_id errado)
2. **RLS policy** bloqueando acesso
3. **Frontend não está fazendo fetch** (useEffect não disparando)

**Cole aqui:**
- Resultado do DIAGNOSTICO_BUDGET_INTEGRATION.sql
- Logs do console do navegador
- Screenshot do card/página

E eu corrijo o código exato que está causando o problema! 🎯
