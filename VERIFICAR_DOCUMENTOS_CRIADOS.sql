-- VERIFICAR SE DOCUMENTOS FORAM CRIADOS NO ONBOARDING
-- Execute este script no Supabase SQL Editor

-- 1. Ver TODOS os documentos financeiros (sem filtro)
SELECT 
    id,
    name,
    user_id,
    workspace_id,
    created_at,
    template_type,
    template_config
FROM finance_documents
ORDER BY created_at DESC
LIMIT 20;

-- 2. Ver documentos do usuário específico (kleoveministry@gmail.com)
SELECT 
    fd.id,
    fd.name,
    fd.user_id,
    fd.workspace_id,
    fd.created_at,
    fd.template_type,
    fd.template_config,
    u.email as user_email
FROM finance_documents fd
JOIN auth.users u ON u.id = fd.user_id
WHERE u.email = 'kleoveministry@gmail.com'
ORDER BY fd.created_at DESC;

-- 3. Ver se existe "Orçamento Onboarding" criado
SELECT 
    fd.id,
    fd.name,
    fd.user_id,
    fd.workspace_id,
    fd.created_at,
    u.email as user_email
FROM finance_documents fd
JOIN auth.users u ON u.id = fd.user_id
WHERE fd.name LIKE '%Orçamento%' OR fd.name LIKE '%Onboarding%'
ORDER BY fd.created_at DESC;

-- 4. Contar documentos por usuário
SELECT 
    u.email,
    COUNT(fd.id) as total_documentos
FROM auth.users u
LEFT JOIN finance_documents fd ON fd.user_id = u.id
GROUP BY u.email
ORDER BY total_documentos DESC;

-- 5. Ver transações criadas no onboarding
SELECT 
    ft.id,
    ft.description,
    ft.type,
    ft.amount,
    ft.created_at,
    fd.name as documento_nome,
    u.email as user_email
FROM finance_transactions ft
JOIN finance_documents fd ON fd.id = ft.finance_document_id
JOIN auth.users u ON u.id = fd.user_id
WHERE u.email = 'kleoveministry@gmail.com'
ORDER BY ft.created_at DESC
LIMIT 10;
