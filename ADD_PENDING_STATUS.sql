-- Adicionar status 'pending' na tabela projects
-- Execute este SQL no seu banco Supabase

-- Verificar constraint existente
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'projects'::regclass 
AND conname LIKE '%status%';

-- Se houver constraint, dropar e recriar com 'pending'
-- (substitua 'nome_da_constraint' pelo nome real retornado acima)
-- ALTER TABLE projects DROP CONSTRAINT nome_da_constraint;

-- Adicionar constraint com todos os status incluindo 'pending'
ALTER TABLE projects 
DROP CONSTRAINT IF EXISTS projects_status_check;

ALTER TABLE projects 
ADD CONSTRAINT projects_status_check 
CHECK (status IN ('pending', 'active', 'completed', 'archived'));

-- Opcional: Atualizar projetos existentes sem status para 'pending'
UPDATE projects 
SET status = 'pending' 
WHERE status IS NULL;
