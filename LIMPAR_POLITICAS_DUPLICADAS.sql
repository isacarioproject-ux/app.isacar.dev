-- LIMPAR POLÍTICAS DUPLICADAS DE finance_documents
-- Execute este script no Supabase SQL Editor

-- 1. Remover TODAS as políticas antigas
DROP POLICY IF EXISTS "Create finance documents" ON finance_documents;
DROP POLICY IF EXISTS "Delete finance documents" ON finance_documents;
DROP POLICY IF EXISTS "Update finance documents" ON finance_documents;
DROP POLICY IF EXISTS "View finance documents" ON finance_documents;
DROP POLICY IF EXISTS "Users can create their own finance documents" ON finance_documents;
DROP POLICY IF EXISTS "Users can delete their own finance documents" ON finance_documents;
DROP POLICY IF EXISTS "Users can update their own finance documents" ON finance_documents;
DROP POLICY IF EXISTS "Users can view their own finance documents" ON finance_documents;

-- 2. Criar APENAS as políticas corretas (sem duplicação)

-- SELECT: Usuário vê seus documentos OU documentos do workspace onde é membro
CREATE POLICY "View finance documents"
ON finance_documents
FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  workspace_id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  )
);

-- INSERT: Usuário cria documentos para si mesmo em workspaces onde é membro
CREATE POLICY "Create finance documents"
ON finance_documents
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND (
    workspace_id IS NULL 
    OR 
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  )
);

-- UPDATE: Usuário atualiza seus documentos OU documentos do workspace onde é membro
CREATE POLICY "Update finance documents"
ON finance_documents
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR 
  workspace_id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  )
);

-- DELETE: Usuário deleta seus documentos OU é admin/owner do workspace
CREATE POLICY "Delete finance documents"
ON finance_documents
FOR DELETE
USING (
  auth.uid() = user_id 
  OR 
  workspace_id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  )
);

-- 3. Verificar políticas criadas
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'finance_documents'
ORDER BY cmd, policyname;
