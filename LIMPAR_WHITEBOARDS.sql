-- LIMPAR TABELA WHITEBOARDS (NÃO EXISTE MAIS NA PLATAFORMA)
-- Execute este script no Supabase SQL Editor

-- 1. Deletar todos os whiteboards
DELETE FROM whiteboards;

-- 2. Verificar se foi deletado (deve retornar 0 linhas)
SELECT COUNT(*) as total_whiteboards FROM whiteboards;

-- 3. OPCIONAL: Se quiser deletar a tabela completamente
-- DROP TABLE IF EXISTS whiteboards CASCADE;

-- RESULTADO ESPERADO: 
-- - Nenhum whiteboard no banco
-- - Atividades recentes não mostrarão mais whiteboards
