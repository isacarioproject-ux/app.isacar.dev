-- ============================================
-- ADICIONAR COLUNAS DE PLANO NO WORKSPACES
-- Execute SOMENTE este SQL no Supabase SQL Editor
-- ============================================

-- Verificado pelo MCP: workspace_invites JÁ EXISTE ✅
-- Faltam apenas as colunas de plano em workspaces

-- 1. ADICIONAR COLUNAS (se não existirem)
DO $$ 
BEGIN
  -- Adicionar plan_type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='workspaces' AND column_name='plan_type'
  ) THEN
    ALTER TABLE workspaces ADD COLUMN plan_type TEXT DEFAULT 'trial';
    RAISE NOTICE 'Coluna plan_type adicionada';
  ELSE
    RAISE NOTICE 'Coluna plan_type já existe';
  END IF;

  -- Adicionar trial_ends_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='workspaces' AND column_name='trial_ends_at'
  ) THEN
    ALTER TABLE workspaces ADD COLUMN trial_ends_at TIMESTAMPTZ;
    RAISE NOTICE 'Coluna trial_ends_at adicionada';
  ELSE
    RAISE NOTICE 'Coluna trial_ends_at já existe';
  END IF;

  -- Adicionar max_members
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='workspaces' AND column_name='max_members'
  ) THEN
    ALTER TABLE workspaces ADD COLUMN max_members INTEGER DEFAULT 5;
    RAISE NOTICE 'Coluna max_members adicionada';
  ELSE
    RAISE NOTICE 'Coluna max_members já existe';
  END IF;

  -- Adicionar subscription_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='workspaces' AND column_name='subscription_id'
  ) THEN
    ALTER TABLE workspaces ADD COLUMN subscription_id TEXT;
    RAISE NOTICE 'Coluna subscription_id adicionada';
  ELSE
    RAISE NOTICE 'Coluna subscription_id já existe';
  END IF;

  -- Adicionar subscription_status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='workspaces' AND column_name='subscription_status'
  ) THEN
    ALTER TABLE workspaces ADD COLUMN subscription_status TEXT;
    RAISE NOTICE 'Coluna subscription_status adicionada';
  ELSE
    RAISE NOTICE 'Coluna subscription_status já existe';
  END IF;

  -- Adicionar plan_updated_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='workspaces' AND column_name='plan_updated_at'
  ) THEN
    ALTER TABLE workspaces ADD COLUMN plan_updated_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Coluna plan_updated_at adicionada';
  ELSE
    RAISE NOTICE 'Coluna plan_updated_at já existe';
  END IF;
END $$;

-- 2. CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_workspaces_plan_type ON workspaces(plan_type);
CREATE INDEX IF NOT EXISTS idx_workspaces_trial_ends ON workspaces(trial_ends_at);

-- 3. VERIFICAR RESULTADO
SELECT 
  'Colunas adicionadas com sucesso!' as status,
  COUNT(*) FILTER (WHERE column_name IN ('plan_type', 'trial_ends_at', 'max_members')) as colunas_plano
FROM information_schema.columns 
WHERE table_name = 'workspaces';

-- 4. MOSTRAR ESTRUTURA ATUAL
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'workspaces'
  AND column_name IN ('plan_type', 'trial_ends_at', 'max_members', 'subscription_id', 'subscription_status')
ORDER BY column_name;
