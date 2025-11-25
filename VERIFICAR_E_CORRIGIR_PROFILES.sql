-- ============================================
-- VERIFICAR E CORRIGIR TABELA PROFILES
-- ============================================

-- ============================================
-- 1. VERIFICAR ESTRUTURA ATUAL
-- ============================================

-- Ver colunas da tabela profiles
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ============================================
-- 2. ADICIONAR COLUNAS FALTANTES
-- ============================================

-- Adicionar coluna 'name' se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN name TEXT;
    RAISE NOTICE 'Coluna "name" adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna "name" já existe';
  END IF;
END $$;

-- Adicionar coluna 'avatar_url' se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    RAISE NOTICE 'Coluna "avatar_url" adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna "avatar_url" já existe';
  END IF;
END $$;

-- Adicionar coluna 'phone' se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    RAISE NOTICE 'Coluna "phone" adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna "phone" já existe';
  END IF;
END $$;

-- Adicionar coluna 'bio' se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'bio'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN bio TEXT;
    RAISE NOTICE 'Coluna "bio" adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna "bio" já existe';
  END IF;
END $$;

-- Adicionar coluna 'website' se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'website'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN website TEXT;
    RAISE NOTICE 'Coluna "website" adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna "website" já existe';
  END IF;
END $$;

-- Adicionar coluna 'created_at' se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Coluna "created_at" adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna "created_at" já existe';
  END IF;
END $$;

-- Adicionar coluna 'updated_at' se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Coluna "updated_at" adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna "updated_at" já existe';
  END IF;
END $$;

-- ============================================
-- 3. POPULAR COLUNA 'name' PARA REGISTROS EXISTENTES
-- ============================================

-- Atualizar registros que não têm 'name'
UPDATE public.profiles p
SET name = COALESCE(
  u.raw_user_meta_data->>'name',
  u.raw_user_meta_data->>'full_name',
  split_part(p.email, '@', 1),
  'Usuário'
)
FROM auth.users u
WHERE p.id = u.id
  AND (p.name IS NULL OR p.name = '');

-- ============================================
-- 4. VERIFICAR RESULTADO
-- ============================================

-- Ver estrutura atualizada
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Ver dados
SELECT 
  id,
  email,
  name,
  avatar_url,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

-- Contar registros
SELECT 
  COUNT(*) as total_profiles,
  COUNT(name) as profiles_with_name,
  COUNT(*) - COUNT(name) as profiles_without_name
FROM public.profiles;
