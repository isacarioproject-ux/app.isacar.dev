# 📁 ARQUITETURA DE PROJETOS E DOCUMENTOS

## 🎯 CONCEITO CORRETO

### Estrutura Hierárquica:
```
PROJETO (pasta)
  └─ DOCUMENTOS (milhares possíveis)
      ├─ Documento 1
      ├─ Documento 2
      ├─ Documento 3
      └─ ... infinitos
```

---

## 📊 BANCO DE DADOS

### Tabelas:

#### 1. `projects` (Projetos/Pastas)
```sql
- id
- user_id
- workspace_id
- name
- description
- status ('Planejamento' | 'Em andamento' | 'Concluído' | 'Pausado' | 'Cancelado')
- progress
- color
- created_at
- updated_at
```

#### 2. `project_documents` (Documentos dentro de cada projeto)
```sql
- id
- project_id (FK → projects.id) ON DELETE CASCADE
- user_id
- workspace_id
- name
- description
- status (mesmo enum dos projetos)
- is_private
- shared_with (TEXT[])
- finance_doc_count
- created_at
- updated_at
```

#### 3. `finance_documents` (Documentos financeiros)
```sql
- id
- project_id (FK → projects.id) ← NOVA COLUNA
- user_id
- workspace_id
- name
- template_type
- ...
```

---

## 🖥️ INTERFACE DO USUÁRIO

### Página `/meus-projetos`
- **Lista PROJETOS** (pastas)
- Grid de cards com os projetos
- Clica em projeto → Abre `ProjectManager`

### Componente `ProjectManager`
Mostra **DOCUMENTOS** do projeto em 4 abas:

#### ✅ Aba 1: "Todos os Projetos"
- **Tabela** com TODOS os documentos
- Cada linha = 1 documento
- Colunas: Nome, Descrição, Status, Data, Compartilhado, etc.

#### ✅ Aba 2: "Por Status"
- **Kanban** com documentos organizados por status
- Colunas:
  1. Concluídos
  2. Em Progresso
  3. Pendente
  4. Sem Status
- Drag & Drop funcional

#### ✅ Aba 3: "Gráfico"
- **Gráfico Pizza** mostrando:
  - Quantos documentos em cada status
  - Percentuais
  - Cores por status

#### ✅ Aba 4: "Calendário"
- **Calendário** com documentos por data
- created_at dos documentos

---

## 🔗 INTEGRAÇÃO

### Projects ↔ Finance Documents

Quando usuario vincular finance_documents a um projeto:
```typescript
finance_documents.project_id = project.id
```

Isso permite:
- Ver quantos docs finance cada documento tem
- Filtrar docs finance por projeto
- Dashboard de finanças por projeto

---

## 📝 MIGRATIONS NECESSÁRIAS

### 1. ✅ `add_project_id_to_finance_documents.sql`
```sql
ALTER TABLE finance_documents 
ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
```

### 2. ✅ `create_project_documents.sql`
```sql
CREATE TABLE project_documents (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  ...
);
```

---

## 💻 CÓDIGO

### Hook: `use-project-items.ts`
```typescript
// Busca DOCUMENTOS de um projeto específico
export function useProjectItems(projectId: string) {
  // SELECT * FROM project_documents WHERE project_id = projectId
  
  return {
    items, // documentos
    loading,
    updateStatus,
    updateName,
    updateDescription,
    deleteItem,
    createItem,
    refresh
  }
}
```

### Componente: `ProjectManager`
```typescript
// Recebe projectId do projeto clicado
export function ProjectManager({ projectId, projectName, onBack }) {
  // Hook busca documentos desse projeto
  const { items, loading, ... } = useProjectItems(projectId)
  
  // Renderiza 4 abas com os documentos
  return (
    <Tabs>
      <TabsContent value="all">Tabela</TabsContent>
      <TabsContent value="status">Kanban</TabsContent>
      <TabsContent value="cards">Gráfico</TabsContent>
      <TabsContent value="calendar">Calendário</TabsContent>
    </Tabs>
  )
}
```

---

## 🎯 FLUXO COMPLETO

1. Usuario vai em `/meus-projetos`
2. Vê lista de PROJETOS (pastas)
3. Clica em "Projeto Website"
4. Abre `ProjectManager(projectId="abc123")`
5. Hook busca `project_documents WHERE project_id='abc123'`
6. Mostra documentos nas 4 abas:
   - Aba 1: Tabela com todos
   - Aba 2: Kanban por status
   - Aba 3: Gráfico pizza
   - Aba 4: Calendário

---

## ✅ CHECKLIST

- [x] Migration: `create_project_documents.sql`
- [x] Types: `ProjectDocument` interface
- [x] Hook: `use-project-items.ts` busca documentos
- [x] Componente: `ProjectManager` renderiza documentos
- [ ] Migration executada no Supabase
- [ ] Testar criação de documentos
- [ ] Testar kanban com drag & drop
- [ ] Testar vinculação com finance_documents

---

## 🚀 PRÓXIMOS PASSOS

1. **Executar migrations no Supabase Dashboard:**
   ```sql
   -- Executar: create_project_documents.sql
   ```

2. **Testar no navegador:**
   - Criar projeto
   - Criar documentos dentro do projeto
   - Mover documentos no kanban
   - Ver gráfico e calendário

3. **Implementar vinculação Finance:**
   - Popover para buscar finance_documents
   - Vincular/desvincular
   - Mostrar contador

---

## 📌 IMPORTANTE

**NÃO CONFUNDIR:**
- ❌ `projects` ≠ documentos (são PASTAS)
- ✅ `project_documents` = documentos (DENTRO das pastas)
- Um projeto pode ter **1.000.000 de documentos**
- Cada documento tem status, descrição, data, etc.
