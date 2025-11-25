# 🚀 SOLUÇÃO RÁPIDA - ERRO DE AUTENTICAÇÃO

## ❌ ERRO ATUAL:
```
ERROR: 42703: column "name" of relation "profiles" does not exist
```

## ✅ SOLUÇÃO EM 2 PASSOS:

---

### **PASSO 1: Executar SQL Corrigido** 

1. **Abra:** Supabase Dashboard → SQL Editor
2. **Copie:** TODO o conteúdo de `CORRIGIR_AUTH_TRIGGER_V2.sql`
3. **Cole** no editor
4. **Clique:** Run (ou Ctrl+Enter)
5. **Aguarde:** Deve executar sem erros

**O que este script faz:**
- ✅ Cria tabela `profiles` se não existir
- ✅ **Adiciona colunas faltantes** (name, avatar_url, etc)
- ✅ Configura RLS e policies
- ✅ Cria trigger e função
- ✅ Migra usuários existentes

---

### **PASSO 2: Testar**

#### **Teste 1: Verificar estrutura**
No SQL Editor, execute:
```sql
-- Ver colunas da tabela profiles
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

**Deve mostrar:**
- id (uuid)
- email (text)
- **name (text)** ← DEVE EXISTIR AGORA
- avatar_url (text)
- phone (text)
- bio (text)
- website (text)
- created_at (timestamptz)
- updated_at (timestamptz)

#### **Teste 2: Cadastrar usuário**
1. Abra: http://localhost:5173
2. Clique: "Criar conta"
3. Preencha dados
4. ✅ **Deve funcionar sem erro 500**

#### **Teste 3: Login Google**
1. Clique: "Continuar com Google"
2. Selecione conta
3. ✅ **Deve funcionar e criar perfil automaticamente**

---

## 🔍 VERIFICAR SE FUNCIONOU:

### No SQL Editor:
```sql
-- Ver perfis criados
SELECT id, email, name, created_at
FROM profiles
ORDER BY created_at DESC;

-- Contar
SELECT 
  (SELECT COUNT(*) FROM auth.users) as usuarios,
  (SELECT COUNT(*) FROM profiles) as perfis;
```

**Resultado esperado:** Número de usuários = número de perfis

---

## 🐛 SE AINDA HOUVER ERRO:

### Erro: "column X does not exist"
**Solução:** Execute `VERIFICAR_E_CORRIGIR_PROFILES.sql`

### Erro: "permission denied"
**Solução:** Você precisa ser owner do projeto no Supabase

### Erro: "trigger already exists"
**Solução:** Normal, o script remove e recria automaticamente

---

## 📊 COMANDOS ÚTEIS:

### Ver triggers:
```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

### Ver função:
```sql
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';
```

### Deletar usuário de teste:
```sql
-- CUIDADO: Isso deleta permanentemente
DELETE FROM auth.users WHERE email = 'teste@exemplo.com';
```

---

## ✅ CHECKLIST FINAL:

Antes de testar, confirme:

- [ ] Script `CORRIGIR_AUTH_TRIGGER_V2.sql` executado sem erros
- [ ] Coluna `name` existe na tabela `profiles`
- [ ] Trigger `on_auth_user_created` existe
- [ ] Função `handle_new_user()` existe
- [ ] RLS habilitado na tabela `profiles`
- [ ] Policies criadas

---

## 🎯 ORDEM DE EXECUÇÃO:

1. ✅ **Execute:** `CORRIGIR_AUTH_TRIGGER_V2.sql` (ESTE É O PRINCIPAL!)
2. ✅ **Verifique:** Estrutura da tabela profiles
3. ✅ **Teste:** Cadastro de usuário
4. ✅ **Teste:** Login com Google
5. ✅ **Confirme:** Perfis sendo criados

---

## 📞 AINDA COM PROBLEMA?

Se após executar `CORRIGIR_AUTH_TRIGGER_V2.sql` ainda houver erro:

1. **Copie** a mensagem de erro COMPLETA
2. **Execute** no SQL Editor:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'profiles';
   ```
3. **Compartilhe** o resultado

---

## 🚀 DIFERENÇA ENTRE OS SCRIPTS:

- **`CORRIGIR_AUTH_TRIGGER.sql`** (antigo): Assumia que colunas não existiam
- **`CORRIGIR_AUTH_TRIGGER_V2.sql`** (novo): **Verifica e adiciona** colunas faltantes
- **`VERIFICAR_E_CORRIGIR_PROFILES.sql`**: Apenas adiciona colunas (sem trigger)

**USE O V2! É o mais completo e seguro! ✅**
