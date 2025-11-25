-- LIMPAR DOCUMENTOS DE OUTROS USUÁRIOS
-- Execute este script no Supabase SQL Editor

-- 1. Ver documentos que NÃO são do kleoveministry@gmail.com
SELECT 
    fd.id,
    fd.name,
    u.email as user_email,
    fd.created_at
FROM finance_documents fd
JOIN auth.users u ON u.id = fd.user_id
WHERE u.email != 'kleoveministry@gmail.com'
ORDER BY fd.created_at DESC;

-- 2. DELETAR documentos de outros usuários (CUIDADO!)
-- Descomente apenas se tiver certeza que quer deletar
/*
DELETE FROM finance_documents
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email != 'kleoveministry@gmail.com'
);
*/

-- 3. Verificar resultado
SELECT 
    u.email,
    COUNT(fd.id) as total_documentos
FROM auth.users u
LEFT JOIN finance_documents fd ON fd.user_id = u.id
GROUP BY u.email
ORDER BY total_documentos DESC;
