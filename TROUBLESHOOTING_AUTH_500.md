# 🚨 TROUBLESHOOTING: Erro 500 no Cadastro

## ❌ ERRO ATUAL:
```
POST /auth/v1/signup 500 (Internal Server Error)
Database error saving new user
```

## 🔍 CAUSA:
O trigger `on_auth_user_created` está falhando ao criar o perfil, bloqueando o cadastro.

---

## 🛠️ SOLUÇÕES (EM ORDEM DE PRIORIDADE)

### **SOLUÇÃO 1: Trigger com SECURITY DEFINER** ⭐ **RECOMENDADO**

**O que faz:** Executa trigger com permissões elevadas, bypassando RLS

**Como aplicar:**
1. Supabase Dashboard → SQL Editor
2. Copie TODO: `CORRIGIR_AUTH_TRIGGER_V3.sql`
3. Cole e execute
4. Teste cadastro

**Por que funciona:** SECURITY DEFINER permite que o trigger insira na tabela mesmo com RLS ativo

---

### **SOLUÇÃO 2: Desabilitar Trigger Temporariamente** 🚨 **EMERGENCIAL**

**O que faz:** Desabilita trigger para permitir cadastro (perfil criado manualmente depois)

**Como aplicar:**
```sql
-- Desabilitar trigger
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;
```

**Depois de cadastrar usuário:**
```sql
-- Criar perfil manualmente
INSERT INTO public.profiles (id, email, name, created_at, updated_at)
SELECT 
  id, email,
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
  created_at, NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
```

**Vantagem:** Cadastro funciona imediatamente  
**Desvantagem:** Perfis não são criados automaticamente

---

### **SOLUÇÃO 3: Verificar Logs do Supabase** 🔍

**Onde ver:**
```
Supabase Dashboard → Logs → Auth Logs
```

**O que procurar:**
- Mensagens de erro do trigger
- "permission denied"
- "column does not exist"
- "violates row-level security policy"

**Executar debug:**
```sql
-- Ver se trigger está ativo
SELECT trigger_name, tgenabled 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Testar inserção manual
DO $$
BEGIN
  INSERT INTO public.profiles (id, email, name, created_at, updated_at)
  VALUES (gen_random_uuid(), 'teste@exemplo.com', 'Teste', NOW(), NOW());
  RAISE NOTICE 'Inserção funcionou!';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'ERRO: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END $$;
```

---

### **SOLUÇÃO 4: Simplificar Trigger** 🔧

Se V3 não funcionar, use versão minimalista:

```sql
-- Remover trigger antigo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Função super simples
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW; -- Não falha signup
END;
$$;

-- Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## 🎯 ORDEM DE EXECUÇÃO RECOMENDADA:

### **Passo 1: Tentar V3**
```sql
-- Execute: CORRIGIR_AUTH_TRIGGER_V3.sql
-- Teste: Cadastrar usuário
-- Se funcionar: ✅ PRONTO!
-- Se não funcionar: Vá para Passo 2
```

### **Passo 2: Debug**
```sql
-- Execute: DEBUG_TRIGGER_ERROR.sql
-- Veja: Logs do Supabase Dashboard
-- Identifique: Erro específico
-- Se não conseguir identificar: Vá para Passo 3
```

### **Passo 3: Solução Emergencial**
```sql
-- Execute: SOLUCAO_EMERGENCIAL_AUTH.sql
-- Desabilite: Trigger temporariamente
-- Teste: Cadastro deve funcionar
-- Crie: Perfis manualmente
```

---

## 📊 VERIFICAÇÕES IMPORTANTES:

### **1. RLS está habilitado?**
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';
-- rowsecurity deve ser TRUE
```

### **2. Policies existem?**
```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'profiles';
-- Deve ter policies para SELECT, UPDATE, INSERT
```

### **3. Trigger está ativo?**
```sql
SELECT trigger_name, tgenabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
-- tgenabled: 'O' = enabled, 'D' = disabled
```

### **4. Função existe?**
```sql
SELECT routine_name, security_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';
-- security_type deve ser 'DEFINER'
```

---

## 🐛 ERROS COMUNS E SOLUÇÕES:

### **Erro: "permission denied for table profiles"**
**Causa:** RLS bloqueando inserção  
**Solução:** Use SECURITY DEFINER na função

### **Erro: "column X does not exist"**
**Causa:** Coluna faltando na tabela  
**Solução:** Execute `VERIFICAR_E_CORRIGIR_PROFILES.sql`

### **Erro: "violates row-level security policy"**
**Causa:** Policy muito restritiva  
**Solução:** Adicione policy permissiva para INSERT:
```sql
CREATE POLICY "Permitir inserção via trigger"
  ON public.profiles FOR INSERT
  WITH CHECK (true);
```

### **Erro: "function handle_new_user() does not exist"**
**Causa:** Função não foi criada  
**Solução:** Execute script de criação novamente

---

## 🚀 TESTE FINAL:

Após aplicar solução, teste:

```javascript
// No console do navegador (F12)
// Deve ver estes logs:
🔄 [AuthForm] Iniciando cadastro...
📧 [AuthForm] Email: teste@exemplo.com
👤 [AuthForm] Nome: Teste Usuario
✅ [AuthForm] Cadastro realizado!
```

```sql
-- No SQL Editor
SELECT * FROM profiles 
WHERE email = 'teste@exemplo.com';
-- Deve retornar 1 linha
```

---

## 📞 AINDA COM PROBLEMA?

Se nenhuma solução funcionou:

1. **Desabilite o trigger** (Solução Emergencial)
2. **Compartilhe logs** do Supabase Dashboard
3. **Execute** `DEBUG_TRIGGER_ERROR.sql` e compartilhe resultado
4. **Informe** qual solução tentou e qual erro específico apareceu

---

## 💡 DICA PRO:

Para desenvolvimento, você pode:
1. Desabilitar trigger
2. Criar perfis manualmente via SQL
3. Focar em outras features
4. Corrigir trigger depois com calma

**Não deixe o trigger bloquear seu progresso!** 🚀
