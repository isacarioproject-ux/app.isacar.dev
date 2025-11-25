-- ============================================
-- DEBUG: VERIFICAR ERRO NO TRIGGER
-- ============================================

-- 1. Ver se o trigger está ativo
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';

-- 2. Ver a definição da função
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';

-- 3. Ver policies da tabela profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 4. Testar inserção manual (simular o que o trigger faz)
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_email TEXT := 'teste-manual@exemplo.com';
  test_name TEXT := 'Teste Manual';
BEGIN
  -- Tentar inserir diretamente
  INSERT INTO public.profiles (id, email, name, created_at, updated_at)
  VALUES (test_user_id, test_email, test_name, NOW(), NOW());
  
  RAISE NOTICE 'Inserção manual funcionou! ID: %', test_user_id;
  
  -- Limpar teste
  DELETE FROM public.profiles WHERE id = test_user_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'ERRO na inserção manual: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END $$;

-- 5. Ver permissões da tabela
SELECT 
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name = 'profiles';

-- 6. Ver owner da tabela
SELECT 
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'profiles';
