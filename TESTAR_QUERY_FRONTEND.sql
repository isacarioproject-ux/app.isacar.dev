-- TESTAR EXATAMENTE A QUERY QUE O FRONTEND USA
-- Execute este script no Supabase SQL Editor

-- Esta é a query EXATA que o código está fazendo:
-- user_id = '705552b8-d764-495d-afe7-e00673b23a97' (kleoveministry@gmail.com)
-- workspace_id = 'f3e9f30a-446a-4596-a479-dcdd4bb074c3'

-- 1. Query do FinanceCard e Minha Finança
SELECT *
FROM finance_documents
WHERE user_id = '705552b8-d764-495d-afe7-e00673b23a97'
  AND workspace_id = 'f3e9f30a-446a-4596-a479-dcdd4bb074c3'
ORDER BY created_at DESC;

-- 2. Query do BudgetCard
SELECT 
    id, 
    total_income, 
    total_expenses, 
    template_config
FROM finance_documents
WHERE user_id = '705552b8-d764-495d-afe7-e00673b23a97'
  AND workspace_id = 'f3e9f30a-446a-4596-a479-dcdd4bb074c3'
ORDER BY created_at DESC;

-- 3. Verificar se o workspace está ativo para o usuário
SELECT 
    wm.workspace_id,
    wm.user_id,
    wm.role,
    wm.status,
    w.name as workspace_name
FROM workspace_members wm
JOIN workspaces w ON w.id = wm.workspace_id
WHERE wm.user_id = '705552b8-d764-495d-afe7-e00673b23a97'
  AND wm.workspace_id = 'f3e9f30a-446a-4596-a479-dcdd4bb074c3';

-- 4. Verificar se as políticas RLS estão permitindo
-- Execute como o próprio usuário (auth.uid())
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub TO '705552b8-d764-495d-afe7-e00673b23a97';

SELECT *
FROM finance_documents
WHERE workspace_id = 'f3e9f30a-446a-4596-a479-dcdd4bb074c3'
ORDER BY created_at DESC;

RESET ROLE;
