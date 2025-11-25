-- ============================================
-- POPULAR DADOS DE TESTE - BUDGET
-- ============================================
-- Use este SQL para criar dados de teste rapidamente
-- ATENÇÃO: Substitua os IDs pelos seus valores reais!

-- PASSO 1: Obter seus IDs
-- ============================================
-- Execute primeiro para pegar seus IDs:
/*
SELECT 
  u.id as user_id,
  u.email,
  w.id as workspace_id,
  w.name as workspace_name
FROM auth.users u
LEFT JOIN workspace_members wm ON wm.user_id = u.id
LEFT JOIN workspaces w ON w.id = wm.workspace_id
WHERE u.email = 'kleoveministry@gmail.com';
*/

-- PASSO 2: Criar Documento Financeiro de Teste
-- ============================================
-- SUBSTITUA os valores abaixo:
DO $$
DECLARE
  v_user_id uuid := '705552b8-d764-495d-afe7-e00673b23a97'; -- SEU USER_ID
  v_workspace_id uuid := 'f3e9f30a-446a-4596-a479-dcdd4bb074c3'; -- SEU WORKSPACE_ID
  v_doc_id uuid;
BEGIN
  -- Criar documento financeiro
  INSERT INTO finance_documents (
    name,
    workspace_id,
    user_id,
    template_type,
    template_config,
    total_income,
    total_expenses,
    reference_month,
    reference_year
  ) VALUES (
    'Orçamento Teste - ' || to_char(NOW(), 'DD/MM/YYYY HH24:MI'),
    v_workspace_id,
    v_user_id,
    'custom',
    jsonb_build_object(
      'incomes', jsonb_build_array(
        jsonb_build_object(
          'id', '1',
          'name', 'Salário',
          'value', 5000,
          'date', to_char(NOW(), 'YYYY-MM-DD')
        ),
        jsonb_build_object(
          'id', '2',
          'name', 'Freelance',
          'value', 2000,
          'date', to_char(NOW(), 'YYYY-MM-DD')
        )
      ),
      'reserves', jsonb_build_array(
        jsonb_build_object(
          'id', '1',
          'name', 'Emergência',
          'type', 'emergency',
          'value', 1000,
          'date', to_char(NOW(), 'YYYY-MM-DD')
        ),
        jsonb_build_object(
          'id', '2',
          'name', 'Viagem',
          'type', 'goal',
          'value', 500,
          'date', to_char(NOW(), 'YYYY-MM-DD')
        )
      ),
      'metas', jsonb_build_array(
        jsonb_build_object(
          'id', '1',
          'name', 'Economizar',
          'type', 'savings',
          'value', 3000,
          'date', to_char(NOW(), 'YYYY-MM-DD'),
          'month', EXTRACT(MONTH FROM NOW())::int,
          'year', EXTRACT(YEAR FROM NOW())::int
        ),
        jsonb_build_object(
          'id', '2',
          'name', 'Investir',
          'type', 'investment',
          'value', 2000,
          'date', to_char(NOW(), 'YYYY-MM-DD'),
          'month', EXTRACT(MONTH FROM NOW())::int,
          'year', EXTRACT(YEAR FROM NOW())::int
        )
      )
    ),
    7000, -- total_income (5000 + 2000)
    0,    -- total_expenses (será calculado)
    EXTRACT(MONTH FROM NOW())::int,
    EXTRACT(YEAR FROM NOW())::int
  ) RETURNING id INTO v_doc_id;

  -- Criar transações de teste
  INSERT INTO finance_transactions (
    finance_document_id,
    type,
    category,
    description,
    amount,
    transaction_date,
    payment_method,
    status
  ) VALUES
  (v_doc_id, 'expense', 'Alimentação', 'Supermercado', 500, NOW(), 'credit_card', 'completed'),
  (v_doc_id, 'expense', 'Transporte', 'Gasolina', 300, NOW(), 'debit_card', 'completed'),
  (v_doc_id, 'expense', 'Moradia', 'Aluguel', 1500, NOW(), 'bank_transfer', 'completed'),
  (v_doc_id, 'expense', 'Lazer', 'Cinema', 100, NOW(), 'cash', 'completed'),
  (v_doc_id, 'income', 'Salário', 'Salário Mensal', 5000, NOW(), 'bank_transfer', 'completed'),
  (v_doc_id, 'income', 'Freelance', 'Projeto Web', 2000, NOW(), 'pix', 'completed');

  -- Atualizar total_expenses do documento
  UPDATE finance_documents
  SET total_expenses = (
    SELECT COALESCE(SUM(amount), 0)
    FROM finance_transactions
    WHERE finance_document_id = v_doc_id
    AND type = 'expense'
    AND status = 'completed'
  )
  WHERE id = v_doc_id;

  RAISE NOTICE 'Documento criado com ID: %', v_doc_id;
END $$;

-- PASSO 3: Verificar se foi criado
-- ============================================
SELECT 
  id,
  name,
  total_income,
  total_expenses,
  (total_income - total_expenses) as balance,
  jsonb_pretty(template_config) as config
FROM finance_documents
WHERE name LIKE '%Teste%'
ORDER BY created_at DESC
LIMIT 1;

-- PASSO 4: Verificar transações
-- ============================================
SELECT 
  ft.type,
  ft.category,
  ft.description,
  ft.amount,
  ft.transaction_date
FROM finance_transactions ft
JOIN finance_documents fd ON ft.finance_document_id = fd.id
WHERE fd.name LIKE '%Teste%'
ORDER BY ft.created_at DESC;

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- 1. Documento "Orçamento Teste" criado
-- 2. template_config com incomes (2), reserves (2), metas (2)
-- 3. 6 transações criadas (4 expenses + 2 incomes)
-- 4. total_income = 7000
-- 5. total_expenses = 2400
-- 6. balance = 4600
