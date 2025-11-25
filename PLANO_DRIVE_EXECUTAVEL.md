# 📁 PLANO EXECUTÁVEL - Google Drive Integration

## 🎯 OBJETIVO
Integrar Google Drive completamente no aplicativo seguindo o padrão Notion existente.

---

## 📦 ESTRUTURA DE ARQUIVOS

```
src/
├── components/drive/
│   ├── drive-card.tsx           # Card Dashboard
│   ├── drive-browser.tsx        # Dialog expandido
│   ├── drive-file-row.tsx       # Item de arquivo
│   ├── drive-picker-dialog.tsx  # Seletor para vincular
│   └── drive-upload-zone.tsx    # Drag & drop
├── services/google/
│   └── drive.service.ts         # API Google Drive
├── hooks/
│   ├── use-drive.ts             # Hook principal
│   └── use-drive-upload.ts      # Upload com progresso
└── types/
    └── drive.ts                 # TypeScript types
```

---

## 🎨 PADRÃO UI (Seguir Existente)

### Componentes Base:
- `Card` + `CardHeader` + `CardContent`
- `Dialog` para modals
- `DropdownMenu` para ações
- `Badge` para status
- `Button` variants: outline, ghost, default
- `Skeleton` para loading
- `toast` (sonner) para notificações
- Framer Motion para animações

### Ícones (lucide-react):
- FolderOpen, File, FileText, Image, Video
- Upload, Download, Trash2, MoreVertical
- Cloud, CheckCircle, RefreshCw

---

## 🚀 FASE 1: COMPONENTES BASE (2-3 horas)

### 1.1 DriveCard (Dashboard)
- Lista 5 arquivos recentes
- Botão upload rápido
- Botão expandir
- Status sincronização

### 1.2 DriveFileRow  
- Ícone do tipo
- Nome + tamanho + data
- Menu de ações (view, download, delete)
- Hover animation

### 1.3 DriveService
- listFiles()
- uploadFile()
- downloadFile()
- deleteFile()

### 1.4 useDrive Hook
- Estado: files, loading, uploading
- Métodos: refresh, upload, delete

---

## 🚀 FASE 2: NAVEGAÇÃO COMPLETA (2-3 horas)

### 2.1 DriveBrowser (Dialog)
- Fullscreen com sidebar
- Navegação de pastas
- Busca
- Grid/List view

### 2.2 Upload Zone
- Drag & drop
- Progress bar
- Preview antes upload

### 2.3 Folder Tree
- Estrutura de pastas
- Expandir/colapsar
- Navegação

---

## 🚀 FASE 3: INTEGRAÇÕES (3-4 horas)

### 3.1 Projects + Drive
**Tabela:**
```sql
CREATE TABLE project_drive_files (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  drive_file_id TEXT,
  drive_file_name TEXT,
  created_at TIMESTAMPTZ
);
```

**UI:** Adicionar seção "Arquivos do Drive" no EditProjectDialog

### 3.2 Tasks + Drive
**Tabela:**
```sql
CREATE TABLE task_drive_attachments (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES tasks(id),
  drive_file_id TEXT,
  drive_file_name TEXT,
  attached_at TIMESTAMPTZ
);
```

**UI:** Aba "Anexos" no Task Dialog

### 3.3 Finance + Drive
**Tabela:**
```sql
CREATE TABLE transaction_receipts (
  id UUID PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id),
  drive_file_id TEXT,
  drive_file_name TEXT,
  uploaded_at TIMESTAMPTZ
);
```

**UI:** Seção "Comprovantes" no Transaction Dialog

---

## 🚀 FASE 4: PICKER UNIVERSAL (2 horas)

### 4.1 DrivePickerDialog
- Reutilizável em qualquer lugar
- Navegação completa
- Seleção múltipla
- Callback com arquivos selecionados

### 4.2 Uso:
```tsx
<DrivePickerDialog
  open={showPicker}
  onSelect={(files) => {
    // Vincular arquivos ao projeto/task/etc
    handleFilesSelected(files)
  }}
  onClose={() => setShowPicker(false)}
  multiple={true}
/>
```

---

## 🚀 FASE 5: ANALYTICS (1 hora)

### 5.1 Drive Stats
- Total de arquivos
- Total de espaço usado
- Uploads recentes
- Arquivos mais acessados

### 5.2 Logs
- Usar `log_google_sync` existente
- Service: 'drive'
- Operations: 'upload', 'download', 'delete'

---

## 📊 TABELAS SUPABASE

```sql
-- Arquivos vinculados a projetos
CREATE TABLE project_drive_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id),
  user_id UUID REFERENCES auth.users(id),
  drive_file_id TEXT NOT NULL,
  drive_file_name TEXT NOT NULL,
  drive_file_type TEXT,
  drive_file_size BIGINT,
  drive_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Anexos de tasks
CREATE TABLE task_drive_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id),
  user_id UUID REFERENCES auth.users(id),
  drive_file_id TEXT NOT NULL,
  drive_file_name TEXT NOT NULL,
  drive_file_type TEXT,
  drive_file_url TEXT,
  attached_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comprovantes de transações
CREATE TABLE transaction_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id),
  drive_file_id TEXT NOT NULL,
  drive_file_name TEXT NOT NULL,
  drive_file_url TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE project_drive_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_drive_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_receipts ENABLE ROW LEVEL SECURITY;

-- Policies (usuário do workspace)
CREATE POLICY "Users can manage project files"
  ON project_drive_files FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
```

---

## ⏱️ TEMPO ESTIMADO

- **Fase 1:** 2-3h (Base)
- **Fase 2:** 2-3h (Navegação)
- **Fase 3:** 3-4h (Integrações)
- **Fase 4:** 2h (Picker)
- **Fase 5:** 1h (Analytics)

**TOTAL:** 10-13 horas de desenvolvimento

---

## 🎯 ENTREGÁVEIS

✅ DriveCard no Dashboard
✅ DriveBrowser (dialog expandido)
✅ Vinculação com Projects
✅ Anexos em Tasks
✅ Comprovantes em Finance
✅ DrivePicker reutilizável
✅ Analytics + Logs
✅ 100% integrado com app
✅ UI padrão Notion
✅ Animações Framer Motion
✅ Loading states
✅ Error handling

---

## 🚀 PRÓXIMO PASSO

Quer que eu comece implementando?

Escolha:
1. **Começar FASE 1** (componentes base - 2-3h)
2. **Ver código exemplo** de um componente primeiro
3. **Ajustar plano** antes de começar

Me confirme! 🎉
