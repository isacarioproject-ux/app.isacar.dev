# ✅ VERIFICAR BANCO ANTES DE CRIAR - Usando MCP

## 🎯 OBJETIVO:

Verificar o estado atual do banco Supabase **ANTES** de executar qualquer SQL de criação.

---

## 📋 PASSO A PASSO:

### **1. Execute o Script de Verificação:**

```bash
npm run verify-db
```

### **2. Analise o Resultado:**

O script vai mostrar:

#### ✅ **Se a tabela JÁ EXISTE:**
```
✅ Tabela workspace_invites EXISTE
   Registros atuais: 0
```
**AÇÃO**: Não precisa criar! Pode usar normalmente.

#### ❌ **Se a tabela NÃO EXISTE:**
```
❌ Tabela workspace_invites NÃO EXISTE
   Erro: relation "workspace_invites" does not exist
   Código: PGRST204

📋 AÇÃO: Execute o SQL CRIAR_TABELA_CONVITES_SIMPLES.sql
```
**AÇÃO**: Execute o SQL para criar.

---

## 🔍 O QUE O SCRIPT VERIFICA:

### **1. Tabela workspace_invites**
- ✅ Existe?
- 📊 Quantos registros?
- 📝 Quais convites estão pendentes?

### **2. Colunas em workspaces**
- ✅ plan_type existe?
- ✅ trial_ends_at existe?
- ✅ max_members existe?

### **3. Seus workspaces**
- 📊 Quantos você tem?
- 👤 Qual seu role em cada um?
- 🔑 IDs dos workspaces

### **4. Convites existentes**
- 📧 Quais emails foram convidados?
- 📊 Status de cada convite
- 👥 Roles atribuídos

---

## 📊 EXEMPLO DE SAÍDA:

```
🔍 VERIFICANDO BANCO DE DADOS SUPABASE...

1️⃣ Verificando tabela workspace_invites...
❌ Tabela workspace_invites NÃO EXISTE
   Erro: relation "workspace_invites" does not exist
   Código: PGRST204

📋 AÇÃO: Execute o SQL CRIAR_TABELA_CONVITES_SIMPLES.sql

2️⃣ Verificando colunas em workspaces...
✅ Workspaces OK
   Exemplo:
   - ID: abc123...
   - Nome: Meu Workspace
   - Plano: trial
   - Trial até: 2024-12-01
   - Max membros: 5

3️⃣ Verificando seus workspaces...
✅ Você tem 1 workspace(s)
   1. Meu Workspace (owner)
      ID: abc123-def456-...

4️⃣ Verificando convites existentes...
❌ Não foi possível verificar convites
   Provavelmente a tabela não existe ainda

============================================================
📊 RESUMO:
============================================================
⚠️  TABELA WORKSPACE_INVITES: NÃO EXISTE
    Você PRECISA executar o SQL de criação
✅ COLUNAS DE PLANO: EXISTEM
============================================================

✅ Verificação concluída!
```

---

## 🚀 FLUXO CORRETO:

### **1. SEMPRE verifique primeiro:**
```bash
npm run verify-db
```

### **2. Se NÃO EXISTIR, crie:**
```sql
-- No Supabase SQL Editor
-- Cole o conteúdo de: CRIAR_TABELA_CONVITES_SIMPLES.sql
-- Execute (RUN)
```

### **3. Verifique novamente:**
```bash
npm run verify-db
```

### **4. Resultado esperado:**
```
✅ TABELA WORKSPACE_INVITES: EXISTE
✅ COLUNAS DE PLANO: EXISTEM
```

### **5. Agora sim, teste o onboarding:**
```
F5 → Passo 3 → Adicionar convites → Continuar
```

---

## 🔧 TROUBLESHOOTING:

### **Erro: "tsx not found"**
```bash
# Instalar tsx globalmente
npm install -g tsx

# OU executar direto
npx tsx verificar-banco-supabase.ts
```

### **Erro: "supabase is not defined"**
```bash
# Verificar se .env existe
cat .env

# Deve ter:
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### **Erro: "User not authenticated"**
```bash
# Fazer login primeiro
# Abrir app → Login → Depois executar verify-db
```

---

## 📁 ARQUIVOS RELACIONADOS:

- ✅ `verificar-banco-supabase.ts` - Script de verificação
- ✅ `CRIAR_TABELA_CONVITES_SIMPLES.sql` - SQL para criar
- ✅ `SOLUCAO_ERRO_CONVITES.md` - Guia de solução

---

## ✅ BENEFÍCIOS:

1. ✅ **Evita duplicação** - Não cria se já existe
2. ✅ **Detecta problemas** - Mostra exatamente o que falta
3. ✅ **Seguro** - Só lê, não modifica nada
4. ✅ **Rápido** - Verificação em segundos
5. ✅ **Informativo** - Mostra estado completo do banco

---

## 🎯 PRÓXIMOS PASSOS:

```bash
# 1. Verificar
npm run verify-db

# 2. Se necessário, criar no Supabase
# (Copiar e executar o SQL)

# 3. Verificar novamente
npm run verify-db

# 4. Testar onboarding
npm run dev
```

**Agora você está seguindo o princípio "Verificar antes de criar"! ✅**
