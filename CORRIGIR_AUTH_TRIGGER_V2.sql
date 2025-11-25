-- ============================================
-- CORRIGIR TRIGGER DE AUTENTICAÇÃO - VERSÃO 2
-- ============================================
-- Esta versão verifica e adiciona colunas antes de usar
-- Execute via Supabase SQL Editor

-- ============================================
-- PASSO 1: VERIFICAR/CRIAR TABELA PROFILES
-- ============================================

-- Criar tabela profiles se não existir (estrutura mínima)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT
);

-- ============================================
-- PASSO 2: ADICIONAR COLUNAS FALTANTES
-- ============================================

-- Adicionar 'name'
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN name TEXT;
  END IF;
END $$;

-- Adicionar 'avatar_url'
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- Adicionar 'phone'
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN phone TEXT;
  END IF;
END $$;

-- Adicionar 'bio'
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN bio TEXT;
  END IF;
END $$;

-- Adicionar 'website'
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'website'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN website TEXT;
  END IF;
END $$;

-- Adicionar 'created_at'
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Adicionar 'updated_at'
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- ============================================
-- PASSO 3: CRIAR ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ============================================
-- PASSO 4: CONFIGURAR RLS
-- ============================================

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem inserir próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Service role pode gerenciar perfis" ON public.profiles;

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

CREATE POLICY "Service role pode gerenciar perfis"
  ON public.profiles
  USING (true)
  WITH CHECK (true);

-- ============================================
-- PASSO 5: CRIAR FUNÇÃO DE TRIGGER
-- ============================================

-- Remover função antiga
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Criar função nova
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_name TEXT;
  user_email TEXT;
  user_avatar TEXT;
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
  user_avatar := NEW.raw_user_meta_data->>'avatar_url';
  
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
    user_avatar,
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
    
    -- NÃO FALHAR o signup
    RETURN NEW;
END;
$$;

-- ============================================
-- PASSO 6: CRIAR TRIGGER
-- ============================================

-- Remover trigger antigo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar trigger novo
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PASSO 7: FUNÇÃO PARA ATUALIZAR updated_at
-- ============================================

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
-- PASSO 8: MIGRAR USUÁRIOS EXISTENTES
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
-- PASSO 9: VERIFICAR RESULTADO
-- ============================================

-- Ver estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Contar usuários e perfis
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id WHERE p.id IS NULL) as users_without_profile;

-- Ver últimos perfis
SELECT 
  p.id,
  p.email,
  p.name,
  p.created_at
FROM public.profiles p
ORDER BY p.created_at DESC
LIMIT 10;

-- ============================================
-- ✅ CONCLUSÃO
-- ============================================

-- Se tudo correu bem, você deve ver:
-- 1. Todas as colunas criadas
-- 2. Trigger e função criados
-- 3. Perfis migrados para usuários existentes
-- 4. Total de users = total de profiles

-- Agora teste criar um novo usuário!
