-- ============================================
-- TORNAR COLUNA STATUS OPCIONAL (COM DEFAULT)
-- ============================================

-- 1. Verificar se coluna existe
SELECT column_name, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'workspace_invites' 
  AND column_name = 'status';

-- 2. Se a coluna NÃO existe, criar com default
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='workspace_invites' AND column_name='status'
  ) THEN
    ALTER TABLE workspace_invites 
    ADD COLUMN status TEXT DEFAULT 'pending';
    RAISE NOTICE 'Coluna status criada com default';
  END IF;
END $$;

-- 3. Se existe mas é NOT NULL sem default, corrigir
DO $$
BEGIN
  -- Remover NOT NULL se existir
  ALTER TABLE workspace_invites 
  ALTER COLUMN status DROP NOT NULL;
  
  -- Adicionar default
  ALTER TABLE workspace_invites 
  ALTER COLUMN status SET DEFAULT 'pending';
  
  RAISE NOTICE 'Coluna status agora é opcional com default pending';
END $$;

-- 4. Atualizar registros sem status
UPDATE workspace_invites 
SET status = 'pending' 
WHERE status IS NULL;

-- 5. Forçar reload do cache do Supabase
NOTIFY pgrst, 'reload schema';

-- 6. Verificar resultado final
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'workspace_invites'
  AND column_name = 'status';

-- Deve mostrar:
-- column_name: status
-- is_nullable: YES
-- column_default: 'pending'::text

SELECT '✅ Coluna status agora é opcional com default pending!' as resultado;
