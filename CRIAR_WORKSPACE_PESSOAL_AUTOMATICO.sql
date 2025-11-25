-- ========================================
-- CRIAR WORKSPACE "PESSOAL" AUTOMATICAMENTE NO SIGNUP
-- ========================================
-- Este script cria um trigger que dispara quando um novo usuário
-- é criado (signup) e automaticamente cria um workspace "Pessoal"
-- para ele, garantindo que dados do onboarding fiquem privados.
-- ========================================

-- 1. Criar função que cria workspace pessoal
CREATE OR REPLACE FUNCTION create_personal_workspace_on_signup()
RETURNS TRIGGER AS $$
DECLARE
  personal_workspace_id UUID;
BEGIN
  -- Criar workspace "Pessoal" para o novo usuário
  INSERT INTO workspaces (
    name,
    slug,
    description,
    owner_id,
    plan_type,
    max_members,
    settings
  )
  VALUES (
    'Pessoal',
    'pessoal-' || NEW.id,
    'Workspace pessoal',
    NEW.id,
    'free',
    1,
    jsonb_build_object('is_personal', true)
  )
  RETURNING id INTO personal_workspace_id;

  -- Adicionar usuário como owner do workspace pessoal
  INSERT INTO workspace_members (
    workspace_id,
    user_id,
    role,
    status
  )
  VALUES (
    personal_workspace_id,
    NEW.id,
    'owner',
    'active'
  );

  -- Log de criação
  RAISE NOTICE '✅ Workspace Pessoal criado para usuário %', NEW.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Criar trigger que dispara após signup
DROP TRIGGER IF EXISTS on_auth_user_created_create_personal_workspace ON auth.users;

CREATE TRIGGER on_auth_user_created_create_personal_workspace
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_personal_workspace_on_signup();

-- 3. Criar função auxiliar para buscar workspace pessoal do usuário
CREATE OR REPLACE FUNCTION get_personal_workspace_id(user_uuid UUID)
RETURNS UUID AS $$
DECLARE
  workspace_uuid UUID;
BEGIN
  SELECT w.id INTO workspace_uuid
  FROM workspaces w
  JOIN workspace_members wm ON w.id = wm.workspace_id
  WHERE wm.user_id = user_uuid
  AND w.settings->>'is_personal' = 'true'
  AND wm.status = 'active'
  LIMIT 1;
  
  RETURN workspace_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Comentários
COMMENT ON FUNCTION create_personal_workspace_on_signup() IS 
'Cria automaticamente um workspace "Pessoal" quando um novo usuário faz signup. 
Este workspace é privado e deve conter os dados do onboarding.';

COMMENT ON FUNCTION get_personal_workspace_id(UUID) IS 
'Retorna o ID do workspace pessoal de um usuário. 
Usado nos passos do onboarding para garantir que dados fiquem privados.';

-- 5. Teste (OPCIONAL - apenas para desenvolvimento)
-- SELECT get_personal_workspace_id('607b26fd-45ab-4e68-b298-580760321efc');
