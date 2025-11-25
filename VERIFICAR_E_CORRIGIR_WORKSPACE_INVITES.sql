-- ============================================
-- VERIFICAR E CORRIGIR workspace_invites
-- ============================================

-- 1. VER TODAS AS COLUNAS ATUAIS
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'workspace_invites'
ORDER BY ordinal_position;

-- 2. ADICIONAR COLUNAS QUE FALTAM (se necessário)
DO $$ 
BEGIN
  -- Coluna status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='workspace_invites' AND column_name='status'
  ) THEN
    ALTER TABLE workspace_invites ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
    RAISE NOTICE 'Coluna status adicionada';
  ELSE
    RAISE NOTICE 'Coluna status já existe';
  END IF;

  -- Coluna token
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='workspace_invites' AND column_name='token'
  ) THEN
    ALTER TABLE workspace_invites ADD COLUMN token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex');
    RAISE NOTICE 'Coluna token adicionada';
  ELSE
    RAISE NOTICE 'Coluna token já existe';
  END IF;

  -- Coluna accepted_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='workspace_invites' AND column_name='accepted_at'
  ) THEN
    ALTER TABLE workspace_invites ADD COLUMN accepted_at TIMESTAMPTZ;
    RAISE NOTICE 'Coluna accepted_at adicionada';
  ELSE
    RAISE NOTICE 'Coluna accepted_at já existe';
  END IF;

  -- Coluna created_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='workspace_invites' AND column_name='created_at'
  ) THEN
    ALTER TABLE workspace_invites ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Coluna created_at adicionada';
  ELSE
    RAISE NOTICE 'Coluna created_at já existe';
  END IF;

  -- Coluna updated_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='workspace_invites' AND column_name='updated_at'
  ) THEN
    ALTER TABLE workspace_invites ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Coluna updated_at adicionada';
  ELSE
    RAISE NOTICE 'Coluna updated_at já existe';
  END IF;
END $$;

-- 3. VER ESTRUTURA FINAL
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'workspace_invites'
ORDER BY ordinal_position;

-- 4. FORÇAR ATUALIZAÇÃO DO CACHE DO SUPABASE
NOTIFY pgrst, 'reload schema';

-- 5. MENSAGEM FINAL
SELECT 'Tabela workspace_invites corrigida! Cache atualizado.' as resultado;
