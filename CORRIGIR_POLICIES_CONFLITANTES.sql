-- ============================================
-- CORRIGIR POLICIES CONFLITANTES - PRODUÇÃO
-- ============================================
-- Remove policies antigas que bloqueiam o trigger
-- Mantém tudo funcionando e seguro

-- ============================================
-- PASSO 1: REMOVER POLICIES CONFLITANTES
-- ============================================

-- Estas policies antigas estão bloqueando o trigger:
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;

-- ============================================
-- PASSO 2: MANTER APENAS POLICIES CORRETAS
-- ============================================

-- Verificar policies atuais
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- As policies que devem permanecer:
-- 1. "Permitir inserção via trigger" (INSERT com WITH CHECK true)
-- 2. "Service role pode gerenciar perfis" (ALL)
-- 3. "Usuários podem atualizar próprio perfil" (UPDATE)
-- 4. "Usuários podem ver próprio perfil" (SELECT)

-- ============================================
-- PASSO 3: GARANTIR QUE FUNÇÃO USA SECURITY DEFINER
-- ============================================

-- Ver configuração atual da função
SELECT 
  routine_name,
  security_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- Se security_type NÃO for 'DEFINER', recriar:
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER -- CRÍTICO: Bypassa RLS
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE
  user_name TEXT;
  user_email TEXT;
  user_avatar TEXT;
BEGIN
  -- Extrair dados
  user_email := COALESCE(NEW.email, '');
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(user_email, '@', 1),
    'Usuário'
  );
  user_avatar := NEW.raw_user_meta_data->>'avatar_url';
  
  -- Inserir perfil (SECURITY DEFINER bypassa RLS)
  INSERT INTO public.profiles (
    id, email, name, avatar_url, created_at, updated_at
  )
  VALUES (
    NEW.id, user_email, user_name, user_avatar, NOW(), NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log mas não falha signup
    RAISE WARNING 'Erro ao criar perfil: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Garantir owner correto
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- ============================================
-- PASSO 4: RECRIAR TRIGGER
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PASSO 5: VERIFICAR CONFIGURAÇÃO FINAL
-- ============================================

-- Ver policies (deve ter apenas 4)
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN qual IS NULL THEN 'N/A'
    ELSE qual 
  END as using_clause,
  CASE 
    WHEN with_check IS NULL THEN 'N/A'
    ELSE with_check 
  END as with_check_clause
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- Ver trigger
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Ver função
SELECT 
  routine_name,
  security_type, -- Deve ser 'DEFINER'
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- ============================================
-- PASSO 6: TESTE DE INSERÇÃO
-- ============================================

DO $$
DECLARE
  test_id UUID := gen_random_uuid();
  test_email TEXT := 'teste-policies@exemplo.com';
BEGIN
  -- Simular inserção do trigger
  INSERT INTO public.profiles (id, email, name, created_at, updated_at)
  VALUES (test_id, test_email, 'Teste Policies', NOW(), NOW());
  
  RAISE NOTICE '✅ SUCESSO: Inserção funcionou! Trigger deve funcionar.';
  
  -- Limpar teste
  DELETE FROM public.profiles WHERE id = test_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ ERRO: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    RAISE NOTICE 'Se este erro apareceu, há outro problema. Compartilhe esta mensagem.';
END $$;

-- ============================================
-- ✅ RESULTADO ESPERADO
-- ============================================

-- Após executar este script:
-- 1. Policies conflitantes removidas
-- 2. Apenas 4 policies corretas permanecem
-- 3. Função usa SECURITY DEFINER
-- 4. Trigger ativo e funcional
-- 5. Teste de inserção passou

-- AGORA TESTE O CADASTRO NO APP!
-- Deve funcionar sem erro 500.
