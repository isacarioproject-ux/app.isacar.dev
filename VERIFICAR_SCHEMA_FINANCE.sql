-- VERIFICAR SCHEMA DA TABELA finance_documents
-- Execute este script no Supabase SQL Editor para ver a estrutura real

-- 1. Ver estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'finance_documents'
ORDER BY ordinal_position;

-- 2. Ver políticas RLS (Row Level Security)
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
WHERE tablename = 'finance_documents';

-- 3. Ver índices
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'finance_documents';

-- 4. Ver constraints (chaves estrangeiras, etc)
SELECT
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'finance_documents'::regclass;

-- 5. Testar query que o código está usando
-- Substitua 'SEU_USER_ID' pelo ID real do usuário
SELECT 
    id,
    name,
    user_id,
    workspace_id,
    created_at,
    template_type,
    template_config
FROM finance_documents
-- WHERE user_id = 'SEU_USER_ID'  -- Descomente e coloque o user_id real
ORDER BY created_at DESC
LIMIT 10;
