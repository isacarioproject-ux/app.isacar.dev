-- ============================================
-- DIAGNÓSTICO COMPLETO - INTEGRAÇÃO BUDGET
-- ============================================
-- Execute este SQL no Supabase via MCP para verificar
-- se os dados do onboarding estão sendo salvos corretamente

-- 1. VERIFICAR DOCUMENTOS FINANCEIROS CRIADOS
-- ============================================
SELECT 
  id,
  name,
  workspace_id,
  user_id,
  template_type,
  template_config,
  created_at
FROM finance_documents
WHERE name LIKE '%Orçamento%' OR name LIKE '%Onboarding%'
ORDER BY created_at DESC
LIMIT 10;

-- 2. VERIFICAR TRANSAÇÕES ASSOCIADAS
-- ============================================
SELECT 
  ft.id,
  ft.finance_document_id,
  ft.type,
  ft.category,
  ft.description,
  ft.amount,
  ft.transaction_date,
  fd.name as document_name
FROM finance_transactions ft
JOIN finance_documents fd ON ft.finance_document_id = fd.id
WHERE fd.name LIKE '%Orçamento%' OR fd.name LIKE '%Onboarding%'
ORDER BY ft.created_at DESC
LIMIT 20;

-- 3. VERIFICAR ESTRUTURA DO template_config
-- ============================================
-- Este deve conter: incomes, reserves, metas
SELECT 
  id,
  name,
  jsonb_pretty(template_config) as config_formatted,
  template_config->'incomes' as incomes,
  template_config->'reserves' as reserves,
  template_config->'metas' as metas
FROM finance_documents
WHERE name LIKE '%Orçamento%' OR name LIKE '%Onboarding%'
ORDER BY created_at DESC
LIMIT 5;

-- 4. VERIFICAR WORKSPACES E MEMBROS
-- ============================================
SELECT 
  w.id as workspace_id,
  w.name as workspace_name,
  wm.user_id,
  wm.role,
  COUNT(fd.id) as total_finance_docs
FROM workspaces w
JOIN workspace_members wm ON w.id = wm.workspace_id
LEFT JOIN finance_documents fd ON fd.workspace_id = w.id
GROUP BY w.id, w.name, wm.user_id, wm.role
ORDER BY w.created_at DESC;

-- 5. VERIFICAR ATIVIDADES RECENTES
-- ============================================
-- Se aparecem em atividades mas não nos cards, 
-- o problema é no frontend
SELECT 
  'finance_document' as type,
  id,
  name,
  created_at,
  user_id,
  workspace_id
FROM finance_documents
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 10;

-- 6. VERIFICAR SE HÁ DOCUMENTOS SEM DADOS
-- ============================================
-- Documentos que foram criados mas não têm config
SELECT 
  id,
  name,
  template_config,
  CASE 
    WHEN template_config IS NULL THEN 'SEM CONFIG'
    WHEN template_config = '{}'::jsonb THEN 'CONFIG VAZIO'
    ELSE 'OK'
  END as status
FROM finance_documents
ORDER BY created_at DESC
LIMIT 10;

-- 7. CONTAR TOTAIS POR TIPO
-- ============================================
SELECT 
  'Documentos Financeiros' as item,
  COUNT(*) as total
FROM finance_documents
UNION ALL
SELECT 
  'Transações',
  COUNT(*)
FROM finance_transactions
UNION ALL
SELECT 
  'Workspaces',
  COUNT(*)
FROM workspaces
UNION ALL
SELECT 
  'Membros',
  COUNT(*)
FROM workspace_members;

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- 1. Deve haver pelo menos 1 documento "Orçamento Onboarding"
-- 2. template_config deve ter: incomes, reserves, metas (arrays)
-- 3. Deve haver transações do tipo 'expense' associadas
-- 4. workspace_id e user_id devem estar preenchidos
-- 5. Se tudo estiver OK no banco mas não aparecer no frontend,
--    o problema é na query do componente!
