-- ============================================
-- SOLUÇÃO EMERGENCIAL - DESABILITAR TRIGGER
-- ============================================
-- Use esta solução se o trigger continuar falhando
-- Permite cadastro de usuários SEM criar perfil automaticamente
-- Você pode criar perfis manualmente depois

-- ============================================
-- OPÇÃO 1: DESABILITAR TRIGGER (TEMPORÁRIO)
-- ============================================

-- Desabilitar trigger que está causando erro 500
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- Verificar se foi desabilitado
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  tgenabled -- 'D' = disabled, 'O' = enabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- ============================================
-- AGORA TESTE O CADASTRO
-- ============================================
-- Com o trigger desabilitado, o cadastro deve funcionar
-- O perfil NÃO será criado automaticamente
-- Você precisará criar manualmente (veja abaixo)

-- ============================================
-- CRIAR PERFIL MANUALMENTE PARA USUÁRIO
-- ============================================

-- Após criar usuário, execute isto para criar o perfil:
INSERT INTO public.profiles (id, email, name, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(
    raw_user_meta_data->>'name',
    raw_user_meta_data->>'full_name',
    split_part(email, '@', 1),
    'Usuário'
  ) as name,
  created_at,
  NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Verificar quantos perfis foram criados
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users WHERE id NOT IN (SELECT id FROM public.profiles)) as users_without_profile;

-- ============================================
-- OPÇÃO 2: REABILITAR TRIGGER (DEPOIS DE CORRIGIR)
-- ============================================

-- Quando conseguir corrigir o trigger, reabilite:
-- ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

-- ============================================
-- OPÇÃO 3: REMOVER TRIGGER COMPLETAMENTE
-- ============================================

-- Se preferir não usar trigger automático:
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Neste caso, você precisará criar perfis manualmente
-- ou via código no frontend após signup

-- ============================================
-- VERIFICAR LOGS DO SUPABASE
-- ============================================

-- Para entender o erro real, vá em:
-- Supabase Dashboard → Logs → Auth Logs
-- Procure por erros relacionados a:
-- - handle_new_user
-- - profiles
-- - INSERT

-- ============================================
-- TESTE RÁPIDO
-- ============================================

-- 1. Execute: ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;
-- 2. Tente cadastrar usuário no app
-- 3. Deve funcionar SEM erro 500
-- 4. Execute o INSERT acima para criar perfil manualmente
-- 5. Verifique: SELECT * FROM profiles WHERE email = 'seu-email@teste.com';
