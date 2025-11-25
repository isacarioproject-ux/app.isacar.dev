-- ============================================
-- VER LOGS E WARNINGS DO TRIGGER
-- ============================================

-- 1. Verificar se há warnings/erros recentes
-- (Supabase pode não expor pg_stat_statements, mas vamos tentar)

-- Ver configuração de log_min_messages
SHOW log_min_messages;

-- Tentar ver logs recentes (pode não funcionar em Supabase)
-- SELECT * FROM pg_stat_statements WHERE query LIKE '%handle_new_user%' LIMIT 10;

-- ============================================
-- 2. TESTAR TRIGGER MANUALMENTE
-- ============================================

-- Simular exatamente o que acontece no signup
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_email TEXT := 'teste-trigger-manual@exemplo.com';
  test_metadata JSONB := '{"name": "Teste Trigger", "avatar_url": null}';
BEGIN
  RAISE NOTICE '🔍 Iniciando teste do trigger...';
  RAISE NOTICE '📧 Email: %', test_email;
  RAISE NOTICE '🆔 ID: %', test_user_id;
  
  -- Tentar inserir diretamente na tabela profiles
  -- (simula o que o trigger faz)
  BEGIN
    INSERT INTO public.profiles (id, email, name, created_at, updated_at)
    VALUES (
      test_user_id,
      test_email,
      COALESCE(test_metadata->>'name', split_part(test_email, '@', 1)),
      NOW(),
      NOW()
    );
    
    RAISE NOTICE '✅ Inserção direta funcionou!';
    
    -- Limpar
    DELETE FROM public.profiles WHERE id = test_user_id;
    
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '❌ ERRO na inserção direta: %', SQLERRM;
      RAISE NOTICE '❌ SQLSTATE: %', SQLSTATE;
  END;
  
  RAISE NOTICE '---';
  RAISE NOTICE '🔍 Agora testando via função do trigger...';
  
  -- Criar usuário temporário para testar trigger
  -- (NÃO FUNCIONA em Supabase, mas mostra a ideia)
  -- INSERT INTO auth.users (id, email, raw_user_meta_data) 
  -- VALUES (test_user_id, test_email, test_metadata);
  
END $$;

-- ============================================
-- 3. VERIFICAR PERMISSÕES DETALHADAS
-- ============================================

-- Ver permissões da tabela profiles
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY grantee, privilege_type;

-- Ver owner da função
SELECT 
  routine_name,
  routine_schema,
  security_type,
  definer
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- Ver se há outras constraints que podem estar bloqueando
SELECT
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints
WHERE table_name = 'profiles'
  AND constraint_type != 'PRIMARY KEY';

-- ============================================
-- 4. VERIFICAR SE HÁ OUTROS TRIGGERS
-- ============================================

-- Ver TODOS os triggers na tabela auth.users
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND event_object_schema = 'auth'
ORDER BY action_order;

-- ============================================
-- 5. TENTAR CRIAR USUÁRIO COM TRIGGER DESABILITADO
-- ============================================

-- IMPORTANTE: Vamos testar se o problema é REALMENTE o trigger
-- ou se é algo no próprio signup do Supabase

-- Desabilitar trigger TEMPORARIAMENTE (apenas para teste)
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- AGORA TENTE CADASTRAR NO APP
-- Se funcionar, o problema É o trigger
-- Se NÃO funcionar, o problema é OUTRA COISA

-- Depois de testar, REABILITE:
-- ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

-- ============================================
-- 6. VERIFICAR OUTRAS TABELAS/TRIGGERS
-- ============================================

-- Ver se há outras tabelas relacionadas que podem ter triggers
SELECT 
  t.trigger_name,
  t.event_object_table,
  t.action_statement
FROM information_schema.triggers t
WHERE t.event_object_schema = 'public'
  AND t.action_statement LIKE '%profiles%'
ORDER BY t.event_object_table, t.trigger_name;
