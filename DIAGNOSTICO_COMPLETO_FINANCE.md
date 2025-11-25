# 🔍 DIAGNÓSTICO COMPLETO - FINANCE DOCUMENTS

## 📋 PROBLEMA:
Documentos criados no onboarding (Passo 11) não aparecem em:
- FinanceCard (Dashboard)
- Minha Finança (página)
- BudgetCard (Dashboard)

## 🎯 INVESTIGAÇÃO NECESSÁRIA:

### **PASSO 1: Verificar Schema do Banco**
Execute no Supabase SQL Editor:
```sql
-- Ver estrutura da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'finance_documents'
ORDER BY ordinal_position;
```

**O que verificar:**
- ✅ Existe coluna `user_id`?
- ✅ Existe coluna `workspace_id`?
- ✅ Existe coluna `template_config`?
- ✅ Qual é o tipo de cada coluna?

---

### **PASSO 2: Verificar se Documento foi Criado**
Execute no Supabase SQL Editor:
```sql
-- Ver documentos do seu usuário
SELECT 
    fd.id,
    fd.name,
    fd.user_id,
    fd.workspace_id,
    fd.created_at,
    u.email
FROM finance_documents fd
JOIN auth.users u ON u.id = fd.user_id
WHERE u.email = 'kleoveministry@gmail.com'
ORDER BY fd.created_at DESC;
```

**O que verificar:**
- ✅ Existe "Orçamento Onboarding"?
- ✅ O `user_id` está correto?
- ✅ O `workspace_id` está correto?
- ✅ Quando foi criado (`created_at`)?

---

### **PASSO 3: Verificar Políticas RLS**
Execute no Supabase SQL Editor:
```sql
-- Ver políticas de segurança
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'finance_documents';
```

**O que verificar:**
- ✅ Existe política para SELECT?
- ✅ A política permite `auth.uid() = user_id`?
- ✅ RLS está habilitado?

**Se NÃO existir ou estiver errado, execute:**
`CORRIGIR_RLS_FINANCE_DOCUMENTS.sql`

---

### **PASSO 4: Testar Query Manualmente**
Execute no Supabase SQL Editor:
```sql
-- Substitua USER_ID_AQUI pelo ID real do usuário
SELECT *
FROM finance_documents
WHERE user_id = 'USER_ID_AQUI'
ORDER BY created_at DESC;
```

**Se retornar vazio:**
- ❌ Documento não foi criado
- ❌ RLS está bloqueando
- ❌ `user_id` está errado

**Se retornar dados:**
- ✅ Documento existe
- ✅ Problema está no frontend

---

## 🔧 POSSÍVEIS CAUSAS:

### **Causa 1: RLS Bloqueando**
**Sintoma:** Erro 403 ou query retorna vazio
**Solução:** Execute `CORRIGIR_RLS_FINANCE_DOCUMENTS.sql`

### **Causa 2: Documento Não Foi Criado**
**Sintoma:** Tabela vazia para o usuário
**Solução:** Erro no passo 11 do onboarding, verificar logs do console

### **Causa 3: user_id Incorreto**
**Sintoma:** Documento existe mas com outro `user_id`
**Solução:** Verificar se `user.id` está correto no código

### **Causa 4: workspace_id Incorreto**
**Sintoma:** Documento existe mas filtro de workspace não encontra
**Solução:** Verificar se `currentWorkspace.id` está correto

### **Causa 5: Cache do Frontend**
**Sintoma:** Documento existe no banco mas não aparece
**Solução:** Hard refresh (Ctrl+Shift+R) ou limpar cache

---

## 📝 SCRIPTS CRIADOS:

1. **`VERIFICAR_SCHEMA_FINANCE.sql`**
   - Ver estrutura da tabela
   - Ver políticas RLS
   - Ver índices e constraints

2. **`VERIFICAR_DOCUMENTOS_CRIADOS.sql`**
   - Ver todos os documentos
   - Ver documentos do usuário específico
   - Ver transações criadas

3. **`CORRIGIR_RLS_FINANCE_DOCUMENTS.sql`**
   - Remover políticas antigas
   - Criar políticas corretas
   - Habilitar RLS

---

## 🎯 PRÓXIMOS PASSOS:

### **1. Execute no Supabase (nesta ordem):**
```
1. VERIFICAR_SCHEMA_FINANCE.sql
2. VERIFICAR_DOCUMENTOS_CRIADOS.sql
3. Se necessário: CORRIGIR_RLS_FINANCE_DOCUMENTS.sql
```

### **2. Me envie os resultados:**
- Quantos documentos existem?
- Qual o `user_id` e `workspace_id`?
- Quais políticas RLS existem?
- Há algum erro?

### **3. Com essas informações:**
- Vou identificar o problema real
- Vou corrigir no lugar certo (backend ou frontend)
- Vou garantir que funcione

---

## ⚠️ IMPORTANTE:

**Você está CERTO!** 

O problema pode estar em:
1. **Backend (Supabase):** RLS bloqueando, schema errado, dados não criados
2. **Frontend:** Query errada, filtros incorretos, cache

**Precisamos verificar o BACKEND primeiro** antes de mexer mais no código!

Execute os SQLs e me mostre os resultados! 🔍
