# 🔍 COMO VER OS LOGS REAIS DO ERRO

## 🎯 PRECISAMOS VER O ERRO EXATO DO TRIGGER

O erro "Database error saving new user" é genérico. O erro REAL está nos logs do Supabase.

---

## 📊 PASSO A PASSO:

### **1. Abrir Logs do Supabase**

```
1. Supabase Dashboard
2. Clique em "Logs" (menu lateral esquerdo)
3. Selecione "Postgres Logs" ou "Auth Logs"
4. Filtre por: últimos 5 minutos
```

---

### **2. Tentar Cadastrar Novamente**

```
1. Abra o app: http://localhost:5173
2. Tente criar um usuário
3. Aguarde o erro 500
4. IMEDIATAMENTE volte aos logs do Supabase
5. Clique em "Refresh" nos logs
```

---

### **3. Procurar por:**

No campo de busca dos logs, procure por:

```
- "handle_new_user"
- "profiles"
- "ERROR"
- "WARNING"
- "permission denied"
- "violates"
- "constraint"
```

---

### **4. Copiar Mensagem de Erro Completa**

Você deve ver algo como:

```
ERROR: permission denied for table profiles
ou
ERROR: new row violates row-level security policy
ou
ERROR: duplicate key value violates unique constraint
ou
WARNING: Erro ao criar perfil: [mensagem específica]
```

**COPIE A MENSAGEM COMPLETA E COMPARTILHE!**

---

## 🧪 TESTE ALTERNATIVO (SQL):

Execute no SQL Editor:

```sql
-- Desabilitar trigger TEMPORARIAMENTE
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- TESTE 1: Cadastrar no app
-- Se funcionar → problema É o trigger
-- Se NÃO funcionar → problema é OUTRA COISA

-- Depois de testar, REABILITE:
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;
```

---

## 📋 INFORMAÇÕES QUE PRECISO:

1. **Logs do Supabase** (mensagem de erro específica)
2. **Resultado do teste** (cadastro funciona com trigger desabilitado?)
3. **Resultado deste SQL:**

```sql
-- Execute e compartilhe resultado
SELECT 
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'profiles'
  AND grantee IN ('postgres', 'authenticated', 'anon', 'service_role');
```

---

## 🎯 POSSÍVEIS CAUSAS (baseado em experiência):

### **1. Permissão negada**
```
ERROR: permission denied for table profiles
```
**Solução:** Grant permissões para postgres

### **2. RLS bloqueando**
```
ERROR: new row violates row-level security policy
```
**Solução:** Policy mais permissiva ou SECURITY DEFINER

### **3. Constraint violada**
```
ERROR: duplicate key value violates unique constraint
```
**Solução:** Verificar se email já existe

### **4. Coluna faltando**
```
ERROR: column "X" does not exist
```
**Solução:** Adicionar coluna

### **5. Outro trigger falhando**
```
ERROR: [mensagem de outro trigger]
```
**Solução:** Desabilitar outros triggers

---

## 🚀 AÇÃO IMEDIATA:

**OPÇÃO A: Ver logs e compartilhar**
```
1. Supabase Dashboard → Logs
2. Tente cadastrar
3. Copie erro específico
4. Compartilhe aqui
```

**OPÇÃO B: Desabilitar trigger e testar**
```sql
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;
-- Teste cadastro
-- Funciona? Sim = problema no trigger / Não = problema em outro lugar
```

**OPÇÃO C: Grant permissões extras (tentativa)**
```sql
GRANT ALL ON public.profiles TO postgres;
GRANT INSERT ON public.profiles TO authenticated;
GRANT INSERT ON public.profiles TO anon;
```

---

## ⚠️ SEM OS LOGS REAIS, ESTOU NO ESCURO!

O erro "Database error saving new user" pode ser:
- Trigger falhando
- RLS bloqueando
- Permissão negada
- Constraint violada
- Outro trigger interferindo
- Problema no Supabase Auth

**PRECISO VER A MENSAGEM DE ERRO ESPECÍFICA DOS LOGS!** 🔍
