-- ============================================
-- MIGRAÇÃO: SISTEMA DE CONVITES E PLANOS
-- ============================================
-- Este script cria as estruturas necessárias para:
-- 1. Convites de equipe (workspace_invites)
-- 2. Sistema de planos de assinatura (subscription_plans)
-- 3. Lógica de trial de 14 dias
-- 4. Limpeza automática de membros após trial expirado
-- ============================================

-- ============================================
-- 1. TABELA: workspace_invites
-- Armazena convites pendentes para workspaces
-- ============================================

CREATE TABLE IF NOT EXISTS workspace_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_workspace_invites_workspace ON workspace_invites(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_invites_email ON workspace_invites(email);
CREATE INDEX IF NOT EXISTS idx_workspace_invites_token ON workspace_invites(token);
CREATE INDEX IF NOT EXISTS idx_workspace_invites_status ON workspace_invites(status);
CREATE INDEX IF NOT EXISTS idx_workspace_invites_expires ON workspace_invites(expires_at);

-- RLS Policies
ALTER TABLE workspace_invites ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver convites que enviaram
CREATE POLICY "Users can view their sent invites"
  ON workspace_invites FOR SELECT
  USING (invited_by = auth.uid());

-- Owners/admins podem criar convites para seus workspaces
CREATE POLICY "Workspace owners can create invites"
  ON workspace_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = workspace_invites.workspace_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- Usuários podem atualizar convites que receberam (aceitar/rejeitar)
CREATE POLICY "Users can update their invites"
  ON workspace_invites FOR UPDATE
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR invited_by = auth.uid()
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_workspace_invites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workspace_invites_updated_at
  BEFORE UPDATE ON workspace_invites
  FOR EACH ROW
  EXECUTE FUNCTION update_workspace_invites_updated_at();

-- ============================================
-- 2. ADICIONAR COLUNAS DE PLANO NO WORKSPACES
-- Gerenciar planos de assinatura e trials
-- ============================================

-- Adicionar colunas se não existirem
ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'trial' CHECK (plan_type IN ('free', 'trial', 'paid', 'business')),
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'expired', 'trialing')),
  ADD COLUMN IF NOT EXISTS max_members INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS plan_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Índice para consultas de plano
CREATE INDEX IF NOT EXISTS idx_workspaces_plan_type ON workspaces(plan_type);
CREATE INDEX IF NOT EXISTS idx_workspaces_trial_ends ON workspaces(trial_ends_at);

-- ============================================
-- 3. FUNÇÃO: ACEITAR CONVITE
-- Automaticamente adiciona usuário ao workspace
-- ============================================

CREATE OR REPLACE FUNCTION accept_workspace_invite(invite_token TEXT)
RETURNS JSON AS $$
DECLARE
  v_invite workspace_invites%ROWTYPE;
  v_user_id UUID;
  v_workspace workspace%ROWTYPE;
  v_current_members INTEGER;
BEGIN
  -- Buscar usuário atual
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('error', 'Usuário não autenticado');
  END IF;

  -- Buscar convite
  SELECT * INTO v_invite
  FROM workspace_invites
  WHERE token = invite_token
    AND status = 'pending'
    AND expires_at > NOW();
  
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Convite inválido ou expirado');
  END IF;

  -- Verificar se email corresponde
  IF v_invite.email != (SELECT email FROM auth.users WHERE id = v_user_id) THEN
    RETURN json_build_object('error', 'Email não corresponde ao convite');
  END IF;

  -- Buscar workspace
  SELECT * INTO v_workspace
  FROM workspaces
  WHERE id = v_invite.workspace_id;

  -- Contar membros atuais
  SELECT COUNT(*) INTO v_current_members
  FROM workspace_members
  WHERE workspace_id = v_invite.workspace_id;

  -- Verificar limite de membros baseado no plano (Business é ilimitado)
  IF v_workspace.plan_type = 'free' AND v_current_members >= 1 THEN
    RETURN json_build_object('error', 'Workspace atingiu o limite de membros do plano grátis');
  END IF;

  IF v_workspace.plan_type IN ('trial', 'paid') AND v_current_members >= 5 THEN
    RETURN json_build_object('error', 'Workspace atingiu o limite de membros');
  END IF;

  -- Business plan não tem limite de membros

  -- Adicionar membro ao workspace
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (v_invite.workspace_id, v_user_id, v_invite.role)
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  -- Atualizar convite
  UPDATE workspace_invites
  SET status = 'accepted',
      accepted_at = NOW()
  WHERE id = v_invite.id;

  RETURN json_build_object(
    'success', true,
    'workspace_id', v_invite.workspace_id,
    'role', v_invite.role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. FUNÇÃO: LIMPAR TRIAL EXPIRADO
-- Remove membros extras após trial de 14 dias
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_expired_trial_members()
RETURNS void AS $$
DECLARE
  v_workspace workspaces%ROWTYPE;
  v_members_to_remove UUID[];
BEGIN
  -- Buscar workspaces com trial expirado
  FOR v_workspace IN
    SELECT *
    FROM workspaces
    WHERE plan_type = 'trial'
      AND trial_ends_at < NOW()
  LOOP
    -- Mudar plano para free
    UPDATE workspaces
    SET plan_type = 'free',
        subscription_status = 'expired',
        max_members = 1,
        plan_updated_at = NOW()
    WHERE id = v_workspace.id;

    -- Buscar membros para remover (manter apenas 1 membro mais antigo + owner)
    SELECT ARRAY_AGG(user_id) INTO v_members_to_remove
    FROM (
      SELECT user_id
      FROM workspace_members
      WHERE workspace_id = v_workspace.id
        AND role != 'owner'
      ORDER BY created_at DESC
      OFFSET 1
    ) AS members_to_delete;

    -- Remover membros extras
    IF v_members_to_remove IS NOT NULL THEN
      DELETE FROM workspace_members
      WHERE workspace_id = v_workspace.id
        AND user_id = ANY(v_members_to_remove);

      -- Log da ação
      RAISE NOTICE 'Workspace % trial expirado: removidos % membros', v_workspace.id, array_length(v_members_to_remove, 1);
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. CRON JOB: LIMPAR TRIALS EXPIRADOS
-- Executar diariamente à meia-noite
-- ============================================

-- Nota: Requer extensão pg_cron no Supabase
-- Habilitar no Dashboard: Database > Extensions > pg_cron

-- SELECT cron.schedule(
--   'cleanup-expired-trials',
--   '0 0 * * *', -- Diariamente à meia-noite
--   $$ SELECT cleanup_expired_trial_members(); $$
-- );

-- ============================================
-- 6. FUNÇÃO: VERIFICAR STATUS DO PLANO
-- Retorna informações do plano do workspace
-- ============================================

CREATE OR REPLACE FUNCTION get_workspace_plan_status(p_workspace_id UUID)
RETURNS JSON AS $$
DECLARE
  v_workspace workspaces%ROWTYPE;
  v_member_count INTEGER;
  v_days_remaining INTEGER;
BEGIN
  SELECT * INTO v_workspace
  FROM workspaces
  WHERE id = p_workspace_id;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Workspace não encontrado');
  END IF;

  -- Contar membros
  SELECT COUNT(*) INTO v_member_count
  FROM workspace_members
  WHERE workspace_id = p_workspace_id;

  -- Calcular dias restantes do trial
  IF v_workspace.plan_type = 'trial' AND v_workspace.trial_ends_at IS NOT NULL THEN
    v_days_remaining := EXTRACT(DAY FROM v_workspace.trial_ends_at - NOW());
  ELSE
    v_days_remaining := NULL;
  END IF;

  RETURN json_build_object(
    'plan_type', v_workspace.plan_type,
    'subscription_status', v_workspace.subscription_status,
    'trial_ends_at', v_workspace.trial_ends_at,
    'days_remaining', v_days_remaining,
    'max_members', CASE
      WHEN v_workspace.plan_type = 'free' THEN 1
      WHEN v_workspace.plan_type IN ('trial', 'paid') THEN 5
      WHEN v_workspace.plan_type = 'business' THEN 999
      ELSE 1
    END,
    'current_members', v_member_count,
    'can_add_members', v_member_count < CASE
      WHEN v_workspace.plan_type = 'free' THEN 1
      WHEN v_workspace.plan_type IN ('trial', 'paid') THEN 5
      WHEN v_workspace.plan_type = 'business' THEN 999
      ELSE 1
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. FUNÇÃO: EXPIRAR CONVITES ANTIGOS
-- Remove convites expirados automaticamente
-- ============================================

CREATE OR REPLACE FUNCTION expire_old_invites()
RETURNS void AS $$
BEGIN
  UPDATE workspace_invites
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Cron job para expirar convites (a cada hora)
-- SELECT cron.schedule(
--   'expire-old-invites',
--   '0 * * * *', -- A cada hora
--   $$ SELECT expire_old_invites(); $$
-- );

-- ============================================
-- 8. GRANTS DE PERMISSÕES
-- ============================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON workspace_invites TO authenticated;
GRANT EXECUTE ON FUNCTION accept_workspace_invite TO authenticated;
GRANT EXECUTE ON FUNCTION get_workspace_plan_status TO authenticated;

-- ============================================
-- 9. DADOS DE EXEMPLO (OPCIONAL - REMOVER EM PRODUÇÃO)
-- ============================================

-- Inserir plano trial para workspace existente (ajuste o ID)
-- UPDATE workspaces
-- SET plan_type = 'trial',
--     trial_ends_at = NOW() + INTERVAL '14 days',
--     max_members = 5,
--     subscription_status = 'trialing'
-- WHERE id = 'seu-workspace-id-aqui';

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================

-- COMO USAR:
-- 1. Execute este SQL no SQL Editor do Supabase
-- 2. Verifique se as tabelas foram criadas: SELECT * FROM workspace_invites LIMIT 1;
-- 3. Teste a função de convite no seu app
-- 4. (Opcional) Habilite pg_cron para limpeza automática
-- 5. Monitor logs com: SELECT * FROM workspace_invites WHERE status = 'expired';
