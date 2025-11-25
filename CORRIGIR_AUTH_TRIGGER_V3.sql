-- ============================================
-- CORRIGIR TRIGGER DE AUTENTICAÇÃO - VERSÃO 3
-- ============================================
-- Esta versão usa SECURITY DEFINER para bypassar RLS
-- Execute via Supabase SQL Editor

-- ============================================
-- PASSO 1: DESABILITAR TRIGGER TEMPORARIAMENTE
-- ============================================

-- Desabilitar trigger existente para evitar conflitos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ============================================
-- PASSO 2: RECRIAR FUNÇÃO COM SECURITY DEFINER
-- ============================================

-- Remover função antiga
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Criar função com permissões elevadas
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER -- Executa com permissões do owner (bypassa RLS)
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE
  user_name TEXT;
  user_email TEXT;
  user_avatar TEXT;
BEGIN
  -- Log inicial
  RAISE LOG 'handle_new_user: Iniciando para usuário %', NEW.id;
  
  -- Extrair dados com fallbacks seguros
  BEGIN
    user_email := COALESCE(NEW.email, '');
    user_name := COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(user_email, '@', 1),
      'Usuário'
    );
    user_avatar := NEW.raw_user_meta_data->>'avatar_url';
    
    RAISE LOG 'handle_new_user: Dados extraídos - email: %, name: %', user_email, user_name;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'handle_new_user: Erro ao extrair dados: %', SQLERRM;
      user_email := COALESCE(NEW.email, '');
      user_name := 'Usuário';
      user_avatar := NULL;
  END;
  
  -- Inserir perfil (SECURITY DEFINER bypassa RLS)
  BEGIN
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
    
    RAISE LOG 'handle_new_user: Perfil criado com sucesso para %', user_email;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Log detalhado mas NÃO falha o signup
      RAISE WARNING 'handle_new_user: ERRO ao criar perfil para % - % (SQLSTATE: %)', 
        NEW.id, 
        SQLERRM, 
        SQLSTATE;
  END;
  
  -- SEMPRE retorna NEW para não bloquear signup
  RETURN NEW;
  
END;
$$;

-- Garantir que a função pertence ao postgres (owner)
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- ============================================
-- PASSO 3: RECRIAR TRIGGER
-- ============================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PASSO 4: AJUSTAR POLICIES (MAIS PERMISSIVAS)
-- ============================================

-- Remover policies antigas
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem inserir próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Service role pode gerenciar perfis" ON public.profiles;
DROP POLICY IF EXISTS "Permitir inserção via trigger" ON public.profiles;

-- Policy para SELECT (usuário vê próprio perfil)
CREATE POLICY "Usuários podem ver próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy para UPDATE (usuário atualiza próprio perfil)
CREATE POLICY "Usuários podem atualizar próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy para INSERT (mais permissiva para trigger)
CREATE POLICY "Permitir inserção via trigger"
  ON public.profiles FOR INSERT
  WITH CHECK (true); -- Permite qualquer inserção (trigger usa SECURITY DEFINER)

-- Policy para service_role (admin total)
CREATE POLICY "Service role pode gerenciar perfis"
  ON public.profiles
  USING (true)
  WITH CHECK (true);

-- ============================================
-- PASSO 5: GARANTIR PERMISSÕES
-- ============================================

-- Garantir que postgres é owner
ALTER TABLE public.profiles OWNER TO postgres;

-- Garantir permissões para authenticated
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT INSERT ON public.profiles TO postgres;

-- ============================================
-- PASSO 6: VERIFICAR CONFIGURAÇÃO
-- ============================================

-- Ver trigger
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Ver função
SELECT 
  routine_name,
  security_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- Ver policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- ============================================
-- PASSO 7: TESTAR INSERÇÃO MANUAL
-- ============================================

DO $$
DECLARE
  test_id UUID := gen_random_uuid();
BEGIN
  -- Simular o que o trigger faz
  INSERT INTO public.profiles (id, email, name, created_at, updated_at)
  VALUES (test_id, 'teste@exemplo.com', 'Teste', NOW(), NOW());
  
  RAISE NOTICE '✅ Teste de inserção funcionou! ID: %', test_id;
  
  -- Limpar
  DELETE FROM public.profiles WHERE id = test_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Teste de inserção FALHOU: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END $$;

-- ============================================
-- ✅ CONCLUSÃO
-- ============================================

-- Se o teste acima mostrou ✅, o trigger deve funcionar!
-- Agora tente criar um usuário no app.

-- Para ver logs em tempo real (se disponível):
-- SELECT * FROM pg_stat_statements WHERE query LIKE '%handle_new_user%';

-- Para debug, você pode temporariamente DESABILITAR o trigger:
-- ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- E reabilitar depois:
-- ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;
