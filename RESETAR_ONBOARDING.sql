-- RESETAR ONBOARDING DA CONTA kleoveministry@gmail.com
-- Execute este script no Supabase SQL Editor

-- 1. Deletar registro de onboarding_analytics para forçar recriação
DELETE FROM onboarding_analytics 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'kleoveministry@gmail.com'
);

-- 2. Verificar se foi deletado (deve retornar 0 linhas)
SELECT 
  oa.*,
  u.email
FROM onboarding_analytics oa
JOIN auth.users u ON u.id = oa.user_id
WHERE u.email = 'kleoveministry@gmail.com';

-- 3. OPCIONAL: Se quiser apenas resetar (sem deletar), use este UPDATE:
/*
UPDATE onboarding_analytics 
SET 
  current_step = 1,
  completed = false,
  steps_completed = ARRAY[]::integer[],
  completion_time = NULL,
  last_active_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'kleoveministry@gmail.com'
);
*/

-- APÓS EXECUTAR:
-- 1. Faça logout
-- 2. Faça login novamente
-- 3. Será redirecionado para o onboarding do zero
