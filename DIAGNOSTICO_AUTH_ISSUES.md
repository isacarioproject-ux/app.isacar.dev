# 🚨 DIAGNÓSTICO: PROBLEMAS DE AUTENTICAÇÃO

## 📋 PROBLEMAS IDENTIFICADOS

### 1. **Login Social Google - "Nenhuma sessão encontrada"**
**Causa Provável:**
- URL de callback não configurada corretamente no Supabase
- Sessão não sendo persistida após redirect
- Problema com PKCE flow

### 2. **Cadastro de Usuário - Erro 500**
**Erro:**
```
POST https://jjeudthfiqvvauuqnezs.supabase.co/auth/v1/signup 500 (Internal Server Error)
```

**Causas Prováveis:**
- Trigger ou função no Supabase com erro
- RLS policy bloqueando criação de perfil
- Problema com metadata do usuário
- Falta de tabela `profiles` ou `user_profiles`

---

## 🔍 CHECKLIST DE VERIFICAÇÃO

### No Supabase Dashboard:

#### 1. **Authentication > URL Configuration**
- [ ] Site URL: `http://localhost:5173` (dev) ou `https://seu-dominio.com` (prod)
- [ ] Redirect URLs: 
  - `http://localhost:5173/auth/callback`
  - `https://seu-dominio.com/auth/callback`

#### 2. **Authentication > Providers > Google**
- [ ] Google OAuth habilitado
- [ ] Client ID configurado
- [ ] Client Secret configurado
- [ ] Redirect URI no Google Console: `https://jjeudthfiqvvauuqnezs.supabase.co/auth/v1/callback`

#### 3. **Database > Functions**
Verificar se existe função/trigger que roda no signup:
```sql
-- Ver triggers na tabela auth.users
SELECT * FROM information_schema.triggers 
WHERE event_object_table = 'users';

-- Ver funções relacionadas a auth
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%user%' OR routine_name LIKE '%profile%';
```

#### 4. **Database > Tables**
Verificar se existe tabela de perfis:
```sql
-- Verificar estrutura da tabela profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' OR table_name = 'user_profiles';
```

---

## 🛠️ SOLUÇÕES

### Solução 1: Corrigir Callback do Google

**Problema:** Callback não está processando corretamente o hash fragment.

**Arquivo:** `src/pages/auth/callback.tsx`

**Mudança necessária:**
```typescript
// ANTES (linha 18)
const { data: { session }, error } = await supabase.auth.getSession()

// DEPOIS
const { data: { session }, error } = await supabase.auth.setSession({
  access_token: hashParams.access_token,
  refresh_token: hashParams.refresh_token,
})
```

### Solução 2: Criar/Corrigir Trigger de Signup

**Problema:** Erro 500 ao criar usuário indica problema no backend.

**SQL para criar trigger correto:**
```sql
-- 1. Criar tabela profiles se não existir
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Policies
CREATE POLICY "Usuários podem ver próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 4. Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error mas não falha o signup
    RAISE WARNING 'Erro ao criar perfil: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Solução 3: Melhorar Tratamento de Erros

**Arquivo:** `src/components/auth-form-minimal.tsx`

Adicionar logs detalhados:
```typescript
const { data, error } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  options: {
    data: {
      name: formData.name,
    },
  },
});

if (error) {
  console.error('❌ Erro detalhado no signup:', {
    message: error.message,
    status: error.status,
    name: error.name,
  });
  setErrors({ general: error.message });
  return;
}
```

---

## 🎯 ORDEM DE EXECUÇÃO

1. **Verificar configurações no Supabase Dashboard** (URLs, Google OAuth)
2. **Executar SQL para criar/corrigir trigger** (via SQL Editor)
3. **Atualizar código do callback** (melhorar processamento)
4. **Testar login Google** (deve funcionar)
5. **Testar cadastro de usuário** (deve funcionar)

---

## 📝 LOGS PARA DEBUG

Adicionar no console do navegador:
```javascript
// Ver sessão atual
supabase.auth.getSession().then(console.log)

// Ver usuário atual
supabase.auth.getUser().then(console.log)

// Ver configuração
console.log('Supabase URL:', supabase.supabaseUrl)
```

---

## ⚠️ NOTAS IMPORTANTES

1. O erro `csspeeper-inspector-tools.eb9765a1.js` é de uma extensão do Chrome (CSS Peeper), **NÃO é do seu código**.
2. O erro real é o `500 Internal Server Error` no endpoint `/auth/v1/signup`.
3. Isso indica problema no **backend do Supabase** (trigger/função com erro).
