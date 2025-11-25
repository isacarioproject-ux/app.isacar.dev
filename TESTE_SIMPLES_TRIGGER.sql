-- ============================================
-- TESTE SIMPLES E DIRETO DO TRIGGER
-- ============================================

-- ============================================
-- TESTE 1: Inserção direta na tabela profiles
-- ============================================

DO $$
DECLARE
  test_id UUID := gen_random_uuid();
BEGIN
  RAISE NOTICE '🔍 TESTE 1: Tentando inserir diretamente na tabela profiles...';
  
  INSERT INTO public.profiles (id, email, name, created_at, updated_at)
  VALUES (test_id, 'teste@exemplo.com', 'Teste', NOW(), NOW());
  
  RAISE NOTICE '✅ SUCESSO: Inserção direta funcionou!';
  RAISE NOTICE '📊 Isso significa que a tabela profiles está OK';
  
  -- Limpar
  DELETE FROM public.profiles WHERE id = test_id;
  RAISE NOTICE '🧹 Teste limpo';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ ERRO: %', SQLERRM;
    RAISE NOTICE '❌ SQLSTATE: %', SQLSTATE;
    RAISE NOTICE '📋 Isso significa que há um problema com permissões ou constraints na tabela profiles';
END $$;

-- ============================================
-- TESTE 2: Verificar permissões
-- ============================================

RAISE NOTICE '---';
RAISE NOTICE '🔍 TESTE 2: Verificando permissões...';

SELECT 
  '📊 Permissão: ' || grantee || ' → ' || privilege_type as info
FROM information_schema.table_privileges
WHERE table_name = 'profiles'
  AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- ============================================
-- TESTE 3: Verificar trigger está ativo
-- ============================================

RAISE NOTICE '---';
RAISE NOTICE '🔍 TESTE 3: Verificando trigger...';

SELECT 
  CASE 
    WHEN tgenabled = 'O' THEN '✅ Trigger ATIVO: ' || trigger_name
    WHEN tgenabled = 'D' THEN '❌ Trigger DESABILITADO: ' || trigger_name
    ELSE '⚠️ Trigger em estado desconhecido: ' || trigger_name
  END as status
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- ============================================
-- AGORA FAÇA ISSO:
-- ============================================

-- OPÇÃO A: Se TESTE 1 deu ✅ SUCESSO
--   → A tabela profiles está OK
--   → O problema pode ser:
--     1. Trigger com outro erro
--     2. Outro trigger interferindo
--     3. Problema no Supabase Auth (não no banco)
--   → PRÓXIMO PASSO: Desabilite o trigger e teste:
--     ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;
--     [Teste cadastro no app]
--     ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

-- OPÇÃO B: Se TESTE 1 deu ❌ ERRO
--   → O problema está na tabela profiles ou permissões
--   → PRÓXIMO PASSO: Execute este SQL:
--     GRANT ALL ON public.profiles TO postgres;
--     GRANT INSERT ON public.profiles TO authenticated;
--     [Execute TESTE 1 novamente]
