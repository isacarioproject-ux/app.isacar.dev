-- ============================================
-- CORRIGIR TRIGGER DE AUTENTICAÇÃO
-- ============================================
-- Este script corrige o trigger que causa erro 500 no signup
-- Execute via Supabase SQL Editor

-- ============================================
-- 1. VERIFICAR ESTRUTURA ATUAL
-- ============================================

-- Ver triggers existentes
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';

-- Ver funções relacionadas
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND (routine_name LIKE '%user%' OR routine_name LIKE '%profile%');

-- ============================================
-- 2. VERIFICAR/CRIAR TABELA PROFILES
-- ============================================

-- Criar tabela profiles se não existir
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ============================================
-- 3. CONFIGURAR RLS (ROW LEVEL SECURITY)
-- ============================================

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas se existirem
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem inserir próprio perfil" ON public.profiles;

-- Criar policies
CREATE POLICY "Usuários podem ver próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem inserir próprio perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy para service_role (usado pelo trigger)
CREATE POLICY "Service role pode gerenciar perfis"
  ON public.profiles
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 4. CRIAR FUNÇÃO DE TRIGGER (COM TRATAMENTO DE ERRO)
-- ============================================

-- Remover função antiga se existir
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Criar função nova com tratamento de erro robusto
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_name TEXT;
  user_email TEXT;
BEGIN
  -- Log para debug
  RAISE LOG 'Criando perfil para usuário: %', NEW.id;
  
  -- Extrair dados com fallbacks
  user_email := COALESCE(NEW.email, '');
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(user_email, '@', 1),
    'Usuário'
  );
  
  -- Inserir perfil
  INSERT INTO public.profiles (
    id,
    email,
    name,
    avatar_url,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    user_email,
    user_name,
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();
  
  RAISE LOG 'Perfil criado com sucesso para: %', user_email;
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log detalhado do erro
    RAISE WARNING 'Erro ao criar perfil para %: % (SQLSTATE: %)', 
      NEW.id, 
      SQLERRM, 
      SQLSTATE;
    
    -- NÃO FALHAR o signup, apenas logar o erro
    -- Isso permite que o usuário seja criado mesmo se o perfil falhar
    RETURN NEW;
END;
$$;

-- ============================================
-- 5. CRIAR TRIGGER
-- ============================================

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar trigger novo
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 6. CRIAR FUNÇÃO PARA ATUALIZAR updated_at
-- ============================================

-- Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 7. MIGRAR USUÁRIOS EXISTENTES SEM PERFIL
-- ============================================

-- Criar perfis para usuários que não têm
INSERT INTO public.profiles (id, email, name, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'name',
    u.raw_user_meta_data->>'full_name',
    split_part(u.email, '@', 1),
    'Usuário'
  ) as name,
  u.created_at,
  NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 8. VERIFICAR RESULTADO
-- ============================================

-- Contar usuários e perfis
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id WHERE p.id IS NULL) as users_without_profile;

-- Ver últimos perfis criados
SELECT 
  p.id,
  p.email,
  p.name,
  p.created_at,
  u.created_at as user_created_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
ORDER BY p.created_at DESC
LIMIT 10;

-- ============================================
-- 9. TESTAR TRIGGER
-- ============================================

-- Para testar, você pode criar um usuário de teste via Supabase Auth
-- e verificar se o perfil é criado automaticamente

-- Ver logs (se disponível)
-- SELECT * FROM pg_stat_statements WHERE query LIKE '%handle_new_user%';

-- ============================================
-- ✅ CONCLUSÃO
-- ============================================

-- Após executar este script:
-- 1. Teste criar um novo usuário via signup
-- 2. Verifique se o perfil foi criado: SELECT * FROM profiles WHERE email = 'teste@exemplo.com';
-- 3. Se ainda houver erro, verifique os logs do Supabase Dashboard
