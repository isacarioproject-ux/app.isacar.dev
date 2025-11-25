-- ============================================
-- CRIAR TABELA DE CONVITES - VERSÃO SIMPLIFICADA
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. CRIAR TABELA workspace_invites
CREATE TABLE IF NOT EXISTS workspace_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_workspace_invites_workspace ON workspace_invites(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_invites_email ON workspace_invites(email);
CREATE INDEX IF NOT EXISTS idx_workspace_invites_status ON workspace_invites(status);

-- 3. HABILITAR RLS
ALTER TABLE workspace_invites ENABLE ROW LEVEL SECURITY;

-- 4. POLICY: Ver seus convites
CREATE POLICY IF NOT EXISTS "Users can view their sent invites"
  ON workspace_invites FOR SELECT
  USING (invited_by = auth.uid());

-- 5. POLICY: Criar convites (owners/admins)
CREATE POLICY IF NOT EXISTS "Workspace owners can create invites"
  ON workspace_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = workspace_invites.workspace_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- 6. POLICY: Atualizar seus convites
CREATE POLICY IF NOT EXISTS "Users can update their invites"
  ON workspace_invites FOR UPDATE
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR invited_by = auth.uid()
  );

-- 7. ADICIONAR COLUNAS NO WORKSPACES (se não existirem)
DO $$ 
BEGIN
  -- Adicionar plan_type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='workspaces' AND column_name='plan_type') THEN
    ALTER TABLE workspaces ADD COLUMN plan_type TEXT DEFAULT 'trial';
  END IF;

  -- Adicionar trial_ends_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='workspaces' AND column_name='trial_ends_at') THEN
    ALTER TABLE workspaces ADD COLUMN trial_ends_at TIMESTAMPTZ;
  END IF;

  -- Adicionar max_members
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='workspaces' AND column_name='max_members') THEN
    ALTER TABLE workspaces ADD COLUMN max_members INTEGER DEFAULT 5;
  END IF;
END $$;

-- 8. VERIFICAR SE TABELA FOI CRIADA
SELECT 'Tabela workspace_invites criada com sucesso!' as status,
       COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'workspace_invites';

-- 9. VERIFICAR COLUNAS
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'workspace_invites'
ORDER BY ordinal_position;
