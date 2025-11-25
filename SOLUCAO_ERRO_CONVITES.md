# 🚨 SOLUÇÃO DOS ERROS - Passo a Passo

## ❌ ERROS IDENTIFICADOS:

1. **Erro 400**: Tabela `workspace_invites` não existe
2. **Erro 409**: Workspace já existe (duplicate key)

---

## ✅ SOLUÇÃO RÁPIDA:

### **PASSO 1: Executar SQL no Supabase**

1. Abra o **Supabase Dashboard**
2. Vá em: **SQL Editor** (menu lateral esquerdo)
3. Clique em: **New Query**
4. Copie e cole o conteúdo do arquivo: `CRIAR_TABELA_CONVITES_SIMPLES.sql`
5. Clique em: **Run** (ou F5)
6. ✅ Deve aparecer: "Tabela workspace_invites criada com sucesso!"

### **PASSO 2: Verificar se Funcionou**

Execute esta query no SQL Editor:
```sql
SELECT * FROM workspace_invites LIMIT 1;
```

**Resultado esperado:**
```
Nenhum resultado (tabela vazia)
```

Se der erro "relation does not exist", execute o PASSO 1 novamente.

### **PASSO 3: Limpar Dados Duplicados (Erro 409)**

Execute no SQL Editor:
```sql
-- Ver workspaces duplicados
SELECT w.id, w.name, w.slug, COUNT(wm.user_id) as members
FROM workspaces w
LEFT JOIN workspace_members wm ON w.id = wm.workspace_id
WHERE wm.user_id = auth.uid()
GROUP BY w.id, w.name, w.slug
ORDER BY w.created_at DESC;
```

Se tiver **mais de 1 workspace**, delete os duplicados:
```sql
-- ATENÇÃO: Só execute se tiver workspaces duplicados!
-- Substitua 'workspace-id-antigo' pelo ID do workspace que quer deletar
DELETE FROM workspaces WHERE id = 'workspace-id-antigo';
```

---

## 🧪 TESTE FINAL:

1. **Recarregue a página** do onboarding (F5)
2. **Navegue até o Passo 2** (WorkspaceStep)
3. Se já criou workspace antes:
   - Pule para o Passo 3 diretamente
4. **No Passo 3** (TeamInvite):
   - Adicione 2 emails
   - ✅ Tag deve aparecer
   - Clique "Continuar"
   - ✅ Não deve dar erro 400

---

## 🔍 VERIFICAR SE DEU CERTO:

Após clicar "Continuar" no Passo 3, execute:
```sql
SELECT * FROM workspace_invites 
WHERE invited_by = auth.uid()
ORDER BY created_at DESC;
```

**Deve mostrar:**
```
id  | workspace_id | email           | role   | status  | expires_at
----|--------------|-----------------|--------|---------|------------
uuid| uuid         | joao@isacar.dev | member | pending | 2024-12-01
uuid| uuid         | maria@isacar.dev| member | pending | 2024-12-01
```

---

## 📋 CHECKLIST:

- [ ] Executei o SQL `CRIAR_TABELA_CONVITES_SIMPLES.sql`
- [ ] Tabela `workspace_invites` existe (SELECT * funciona)
- [ ] Limpei workspaces duplicados (se necessário)
- [ ] Recarreguei a página (F5)
- [ ] Testei adicionar convites no Passo 3
- [ ] ✅ Não deu erro 400
- [ ] ✅ Não deu erro 409
- [ ] ✅ Convites foram salvos no Supabase

---

## 🆘 SE AINDA DER ERRO:

### **Erro 400 persiste:**
```sql
-- Verificar se todas as colunas existem
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'workspace_invites';

-- Deve retornar:
-- id, workspace_id, email, role, invited_by, status, token, expires_at, etc
```

### **Erro 409 persiste:**
```sql
-- Verificar constraint
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name = 'workspace_members' 
AND constraint_type = 'UNIQUE';

-- Se tiver: workspace_members_workspace_id_user_id_key
-- Significa que você já é membro desse workspace
-- Solução: Use o workspace existente ou delete o antigo
```

---

## 💡 DICA IMPORTANTE:

Se você já testou o onboarding várias vezes, pode ter:
- ✅ Vários workspaces criados
- ✅ Múltiplos memberships

**Solução**: Limpe tudo e comece fresh:
```sql
-- CUIDADO: Isso deleta TODOS os seus workspaces!
DELETE FROM workspaces 
WHERE id IN (
  SELECT workspace_id FROM workspace_members 
  WHERE user_id = auth.uid() AND role = 'owner'
);

-- Limpar onboarding analytics
DELETE FROM onboarding_analytics WHERE user_id = auth.uid();
```

Depois:
1. Logout
2. Login novamente
3. Onboarding vai começar do zero
4. Sem erros 409! ✅

---

## ✅ PRONTO!

Após executar o SQL, os erros devem sumir e você conseguirá:
- ✅ Criar workspace no Passo 2
- ✅ Adicionar convites no Passo 3
- ✅ Continuar para próximos passos

**Qualquer dúvida, me avise! 🚀**
