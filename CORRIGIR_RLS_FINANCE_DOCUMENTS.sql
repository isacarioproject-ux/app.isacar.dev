-- CORRIGIR POLÍTICAS RLS DA TABELA finance_documents
-- Execute este script no Supabase SQL Editor

-- 1. Ver políticas atuais
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'finance_documents';

-- 2. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can view their own finance documents" ON finance_documents;
DROP POLICY IF EXISTS "Users can create their own finance documents" ON finance_documents;
DROP POLICY IF EXISTS "Users can update their own finance documents" ON finance_documents;
DROP POLICY IF EXISTS "Users can delete their own finance documents" ON finance_documents;

-- 3. Criar políticas corretas

-- SELECT: Usuário pode ver seus próprios documentos
CREATE POLICY "Users can view their own finance documents"
ON finance_documents
FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Usuário pode criar documentos para si mesmo
CREATE POLICY "Users can create their own finance documents"
ON finance_documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Usuário pode atualizar seus próprios documentos
CREATE POLICY "Users can update their own finance documents"
ON finance_documents
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Usuário pode deletar seus próprios documentos
CREATE POLICY "Users can delete their own finance documents"
ON finance_documents
FOR DELETE
USING (auth.uid() = user_id);

-- 4. Garantir que RLS está habilitado
ALTER TABLE finance_documents ENABLE ROW LEVEL SECURITY;

-- 5. Verificar se as políticas foram criadas
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'finance_documents';
