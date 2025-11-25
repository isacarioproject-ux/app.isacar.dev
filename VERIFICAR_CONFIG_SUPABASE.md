# ✅ CHECKLIST: CONFIGURAÇÕES SUPABASE

## 🎯 PASSO A PASSO PARA CORRIGIR AUTENTICAÇÃO

### 1️⃣ AUTHENTICATION > URL CONFIGURATION

Acesse: **Supabase Dashboard → Authentication → URL Configuration**

#### Site URL
```
Desenvolvimento: http://localhost:5173
Produção: https://seu-dominio.com
```

#### Redirect URLs (adicione TODAS)
```
http://localhost:5173/**
http://localhost:5173/auth/callback
https://seu-dominio.com/**
https://seu-dominio.com/auth/callback
```

**❗ IMPORTANTE:** Clique em "Save" após adicionar!

---

### 2️⃣ AUTHENTICATION > PROVIDERS

Acesse: **Supabase Dashboard → Authentication → Providers**

#### Email Provider
- ✅ **Enabled**: ON
- ✅ **Confirm email**: OFF (para desenvolvimento) ou ON (produção)
- ✅ **Secure email change**: ON
- ✅ **Secure password change**: ON

#### Google Provider
- ✅ **Enabled**: ON
- ✅ **Client ID**: `seu-client-id.apps.googleusercontent.com`
- ✅ **Client Secret**: `seu-client-secret`

**Como obter Client ID e Secret:**
1. Acesse: https://console.cloud.google.com/
2. Crie um projeto ou selecione existente
3. Vá em: **APIs & Services → Credentials**
4. Clique: **Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs:
   ```
   https://jjeudthfiqvvauuqnezs.supabase.co/auth/v1/callback
   ```
7. Copie Client ID e Client Secret para o Supabase

---

### 3️⃣ SQL EDITOR

Acesse: **Supabase Dashboard → SQL Editor**

#### Execute o script de correção:
1. Abra o arquivo: `CORRIGIR_AUTH_TRIGGER.sql`
2. Copie TODO o conteúdo
3. Cole no SQL Editor
4. Clique em **Run**
5. Verifique se não há erros

#### Verificar resultado:
```sql
-- Ver se trigger foi criado
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Ver se tabela profiles existe
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles';

-- Contar usuários e perfis
SELECT 
  (SELECT COUNT(*) FROM auth.users) as usuarios,
  (SELECT COUNT(*) FROM public.profiles) as perfis;
```

---

### 4️⃣ TABLE EDITOR

Acesse: **Supabase Dashboard → Table Editor → profiles**

#### Verificar estrutura da tabela:
- ✅ `id` (uuid, primary key)
- ✅ `email` (text)
- ✅ `name` (text)
- ✅ `avatar_url` (text, nullable)
- ✅ `created_at` (timestamptz)
- ✅ `updated_at` (timestamptz)

#### Verificar RLS:
- ✅ **RLS enabled**: ON
- ✅ Policies criadas (ver abaixo)

---

### 5️⃣ AUTHENTICATION > POLICIES

Acesse: **Supabase Dashboard → Authentication → Policies → profiles**

#### Policies necessárias:

**1. Usuários podem ver próprio perfil**
```sql
Policy name: Usuários podem ver próprio perfil
Allowed operation: SELECT
Policy definition: (auth.uid() = id)
```

**2. Usuários podem atualizar próprio perfil**
```sql
Policy name: Usuários podem atualizar próprio perfil
Allowed operation: UPDATE
Policy definition: (auth.uid() = id)
WITH CHECK: (auth.uid() = id)
```

**3. Usuários podem inserir próprio perfil**
```sql
Policy name: Usuários podem inserir próprio perfil
Allowed operation: INSERT
WITH CHECK: (auth.uid() = id)
```

**4. Service role pode gerenciar perfis**
```sql
Policy name: Service role pode gerenciar perfis
Allowed operation: ALL
Policy definition: true
WITH CHECK: true
```

---

### 6️⃣ LOGS

Acesse: **Supabase Dashboard → Logs → Auth Logs**

#### Verificar logs de erro:
1. Tente criar um usuário
2. Veja se aparece erro nos logs
3. Procure por:
   - `handle_new_user`
   - `profiles`
   - `500 Internal Server Error`

---

## 🧪 TESTAR APÓS CONFIGURAÇÃO

### Teste 1: Cadastro de Usuário
1. Abra o app: http://localhost:5173
2. Clique em "Criar conta"
3. Preencha:
   - Nome: Teste Usuario
   - Email: teste@exemplo.com
   - Senha: teste123
4. Clique em "Cadastrar"
5. ✅ **Deve funcionar sem erro 500**

### Teste 2: Login com Google
1. Abra o app: http://localhost:5173
2. Clique em "Continuar com Google"
3. Selecione conta Google
4. ✅ **Deve redirecionar para /dashboard**
5. ✅ **NÃO deve mostrar "Nenhuma sessão encontrada"**

### Teste 3: Verificar Perfil Criado
```sql
-- No SQL Editor
SELECT * FROM profiles 
WHERE email = 'teste@exemplo.com';

-- Deve retornar 1 linha com:
-- - id (UUID)
-- - email
-- - name
-- - created_at
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Nenhuma sessão encontrada" (Google)

**Causa:** Redirect URL não configurada

**Solução:**
1. Vá em: **Authentication → URL Configuration**
2. Adicione: `http://localhost:5173/auth/callback`
3. Salve e teste novamente

---

### Erro: 500 Internal Server Error (Signup)

**Causa:** Trigger com erro ou tabela profiles não existe

**Solução:**
1. Execute: `CORRIGIR_AUTH_TRIGGER.sql`
2. Verifique logs: **Logs → Auth Logs**
3. Procure por erro específico
4. Se erro persistir, desabilite trigger temporariamente:
   ```sql
   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
   ```
5. Teste signup novamente
6. Corrija erro e recrie trigger

---

### Erro: "User already registered"

**Causa:** Email já cadastrado

**Solução:**
1. Use outro email OU
2. Delete usuário existente:
   ```sql
   -- CUIDADO: Isso deleta o usuário permanentemente
   DELETE FROM auth.users WHERE email = 'teste@exemplo.com';
   ```

---

## 📊 COMANDOS ÚTEIS

### Ver todos os usuários
```sql
SELECT id, email, created_at, 
       raw_user_meta_data->>'name' as name
FROM auth.users
ORDER BY created_at DESC;
```

### Ver todos os perfis
```sql
SELECT * FROM profiles
ORDER BY created_at DESC;
```

### Ver usuários SEM perfil
```sql
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.id IS NULL;
```

### Criar perfil manualmente para usuário
```sql
INSERT INTO profiles (id, email, name)
SELECT id, email, 
       COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1))
FROM auth.users
WHERE id = 'UUID-DO-USUARIO'
ON CONFLICT (id) DO NOTHING;
```

---

## ✅ CHECKLIST FINAL

Antes de considerar resolvido, verifique:

- [ ] Site URL configurada
- [ ] Redirect URLs configuradas (localhost E produção)
- [ ] Google OAuth habilitado com Client ID/Secret
- [ ] Redirect URI no Google Console configurada
- [ ] Tabela `profiles` existe
- [ ] RLS habilitado na tabela `profiles`
- [ ] Policies criadas
- [ ] Trigger `on_auth_user_created` existe
- [ ] Função `handle_new_user()` existe
- [ ] Teste de cadastro funciona
- [ ] Teste de login Google funciona
- [ ] Perfis sendo criados automaticamente

---

## 📞 SUPORTE

Se após seguir todos os passos ainda houver erro:

1. **Copie os logs** do console do navegador (F12)
2. **Copie os logs** do Supabase Dashboard
3. **Tire screenshot** do erro
4. **Compartilhe** para análise detalhada

**Logs importantes:**
- Console do navegador (F12 → Console)
- Network tab (F12 → Network → filtrar por "auth")
- Supabase Dashboard → Logs → Auth Logs
