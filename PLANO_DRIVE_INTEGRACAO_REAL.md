# 📁 PLANO REAL - Google Drive Integrado

## 🎯 OBJETIVO CORRETO:
**INTEGRAR** Google Drive nos componentes **EXISTENTES** do app, como Notion faz.

**NÃO criar componentes novos isolados.**
**SIM adicionar funcionalidades Drive onde já existem funcionalidades.**

---

## ✅ INTEGRAÇÕES (Experiência Notion)

### **1. DOCSCARD - Importar/Sincronizar Google Docs** 📄

**Localização:** `src/components/docs-card.tsx`

**O que adicionar:**

#### A) Botão "Importar do Drive" no header
```tsx
<DropdownMenu>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={handleImportFromDrive}>
      <Download className="mr-2 h-4 w-4" />
      Importar do Google Drive
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleSyncWithDrive}>
      <RefreshCw className="mr-2 h-4 w-4" />
      Sincronizar com Drive
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

#### B) Badge nos documentos sincronizados
```tsx
<DocumentRow>
  {doc.drive_file_id && (
    <Badge variant="outline" className="ml-2">
      <Cloud className="h-3 w-3 mr-1" />
      Drive
    </Badge>
  )}
</DocumentRow>
```

#### C) Ações adicionais por documento
```tsx
// No dropdown de cada documento
{doc.drive_file_id && (
  <>
    <DropdownMenuItem onClick={() => openInDrive(doc.drive_file_id)}>
      <ExternalLink className="mr-2 h-4 w-4" />
      Abrir no Drive
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => syncDocument(doc.id)}>
      <RefreshCw className="mr-2 h-4 w-4" />
      Atualizar do Drive
    </DropdownMenuItem>
  </>
)}
```

#### D) Funcionalidade
- Importar Google Docs → converte para PageData local
- Sincronizar automaticamente (bidirecional)
- Indicar status de sync (badge)
- Abrir no Drive (link externo)

**Tabela:**
```sql
ALTER TABLE documents ADD COLUMN drive_file_id TEXT;
ALTER TABLE documents ADD COLUMN drive_synced_at TIMESTAMPTZ;
ALTER TABLE documents ADD COLUMN drive_sync_enabled BOOLEAN DEFAULT false;
```

---

### **2. PROJECTCARD - Vincular Arquivos do Drive** 📁

**Localização:** `src/components/projects/projects-card.tsx`

**O que adicionar:**

#### A) Seção "Arquivos" no card expandido
```tsx
<Card>
  {/* Conteúdo existente */}
  
  {/* Nova seção */}
  <CardContent>
    <div className="flex items-center justify-between mb-3">
      <h4 className="text-sm font-medium">Arquivos do Projeto</h4>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => setShowDrivePicker(true)}
      >
        <Plus className="h-4 w-4 mr-1" />
        Adicionar do Drive
      </Button>
    </div>

    {/* Lista de arquivos vinculados */}
    <div className="space-y-2">
      {projectFiles.map(file => (
        <motion.div
          key={file.id}
          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
        >
          <div className="flex items-center gap-2">
            {getFileIcon(file.mimeType)}
            <span className="text-sm">{file.name}</span>
            <Badge variant="outline" className="text-xs">
              {formatFileSize(file.size)}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => openFile(file)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => unlinkFile(file.id)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      ))}
    </div>

    {/* Empty state */}
    {projectFiles.length === 0 && (
      <div className="text-center py-4 text-sm text-muted-foreground">
        Nenhum arquivo vinculado
      </div>
    )}
  </CardContent>
</Card>
```

#### B) No EditProjectDialog também
```tsx
<DialogContent>
  {/* Campos existentes */}
  
  {/* Nova seção */}
  <div className="space-y-2">
    <Label>Arquivos do Drive</Label>
    <Button 
      variant="outline" 
      className="w-full"
      onClick={() => setShowDrivePicker(true)}
    >
      <FolderOpen className="mr-2 h-4 w-4" />
      Vincular Arquivos
    </Button>
    
    {/* Lista compacta */}
    {projectFiles.map(file => (
      <div key={file.id} className="flex items-center justify-between text-sm p-2 border rounded">
        <span className="truncate">{file.name}</span>
        <Button variant="ghost" size="icon" onClick={() => unlinkFile(file.id)}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    ))}
  </div>
</DialogContent>
```

**Tabela:**
```sql
CREATE TABLE project_drive_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id),
  drive_file_id TEXT NOT NULL,
  drive_file_name TEXT NOT NULL,
  drive_file_type TEXT,
  drive_file_size BIGINT,
  drive_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### **3. TASKCARD - Anexar Arquivos nas Tasks** ✅

**Localização:** `src/components/tasks/` (vários arquivos)

**O que adicionar:**

#### A) Aba "Anexos" no Task Dialog
```tsx
<Dialog>
  <Tabs>
    <TabsList>
      <TabsTrigger value="details">Detalhes</TabsTrigger>
      <TabsTrigger value="subtasks">Subtarefas</TabsTrigger>
      <TabsTrigger value="attachments">
        Anexos
        {attachments.length > 0 && (
          <Badge variant="secondary" className="ml-1">
            {attachments.length}
          </Badge>
        )}
      </TabsTrigger>
    </TabsList>

    <TabsContent value="attachments" className="space-y-3">
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => setShowDrivePicker(true)}
      >
        <Paperclip className="mr-2 h-4 w-4" />
        Anexar do Google Drive
      </Button>

      {/* Lista de anexos */}
      <div className="space-y-2">
        {attachments.map(file => (
          <div key={file.id} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-muted/50">
            {getFileIcon(file.mimeType)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)} • {formatDate(file.attached_at)}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => openFile(file)}>
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => removeAttachment(file.id)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </TabsContent>
  </Tabs>
</Dialog>
```

#### B) Indicador no TaskCard (lista)
```tsx
<TaskCard>
  {/* Conteúdo existente */}
  
  {/* Indicador de anexos */}
  {task.attachments_count > 0 && (
    <Badge variant="outline" className="text-xs">
      <Paperclip className="h-3 w-3 mr-1" />
      {task.attachments_count}
    </Badge>
  )}
</TaskCard>
```

**Tabela:**
```sql
CREATE TABLE task_drive_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id),
  drive_file_id TEXT NOT NULL,
  drive_file_name TEXT NOT NULL,
  drive_file_type TEXT,
  drive_file_size BIGINT,
  drive_file_url TEXT,
  attached_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### **4. FINANCECARD - Comprovantes do Drive** 💰

**Localização:** `src/components/finance/` (transaction dialog)

**O que adicionar:**

#### A) Seção "Comprovantes" no Transaction Dialog
```tsx
<Dialog>
  <DialogContent>
    {/* Campos existentes (valor, categoria, etc) */}
    
    {/* Nova seção de comprovantes */}
    <div className="space-y-2">
      <Label>Comprovantes</Label>
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => setShowDrivePicker(true)}
      >
        <Receipt className="mr-2 h-4 w-4" />
        Adicionar Comprovante
      </Button>
      
      {/* Lista de comprovantes */}
      {receipts.map(file => (
        <div key={file.id} className="flex items-center gap-2 p-2 border rounded">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm flex-1 truncate">{file.name}</span>
          <Button variant="ghost" size="icon" onClick={() => viewReceipt(file)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => removeReceipt(file.id)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  </DialogContent>
</Dialog>
```

#### B) Indicador na lista de transações
```tsx
<TransactionRow>
  {/* Conteúdo existente */}
  
  {/* Ícone de comprovante */}
  {transaction.has_receipt && (
    <Badge variant="outline" className="text-xs">
      <Receipt className="h-3 w-3 mr-1" />
      Comprovante
    </Badge>
  )}
</TransactionRow>
```

**Tabela:**
```sql
CREATE TABLE transaction_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id),
  drive_file_id TEXT NOT NULL,
  drive_file_name TEXT NOT NULL,
  drive_file_url TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🧩 COMPONENTE REUTILIZÁVEL

### **DrivePicker - Seletor Universal**

**Localização:** `src/components/drive/drive-picker-dialog.tsx`

**Único componente novo** (usado em todos os lugares)

```tsx
interface DrivePickerDialogProps {
  open: boolean
  onClose: () => void
  onSelect: (files: DriveFile[]) => void
  multiple?: boolean
  accept?: string[] // tipos de arquivo
}

export function DrivePickerDialog({ 
  open, 
  onClose, 
  onSelect,
  multiple = false,
  accept 
}: DrivePickerDialogProps) {
  const [files, setFiles] = useState<DriveFile[]>([])
  const [selected, setSelected] = useState<DriveFile[]>([])
  const [loading, setLoading] = useState(true)
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[600px]">
        <DialogHeader>
          <DialogTitle>Selecionar do Google Drive</DialogTitle>
        </DialogHeader>

        {/* Busca */}
        <Input 
          placeholder="Buscar arquivos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button variant="ghost" size="sm" onClick={() => setCurrentFolder(null)}>
            <Home className="h-4 w-4 mr-1" />
            Meu Drive
          </Button>
        </div>

        {/* Lista de arquivos */}
        <div className="flex-1 overflow-y-auto space-y-1">
          {loading ? (
            <Skeleton count={5} />
          ) : (
            files.map(file => (
              <motion.div
                key={file.id}
                whileHover={{ scale: 1.01 }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50",
                  selected.includes(file) && "bg-primary/10"
                )}
                onClick={() => handleSelect(file)}
              >
                {/* Checkbox se múltiplo */}
                {multiple && (
                  <input 
                    type="checkbox" 
                    checked={selected.includes(file)}
                    className="rounded"
                  />
                )}
                
                {/* Ícone */}
                {getFileIcon(file.mimeType)}
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)} • {formatDate(file.modifiedTime)}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {selected.length} arquivo(s) selecionado(s)
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                onSelect(selected)
                onClose()
              }}
              disabled={selected.length === 0}
            >
              Selecionar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**Uso em qualquer lugar:**
```tsx
<DrivePicker
  open={showPicker}
  onClose={() => setShowPicker(false)}
  onSelect={(files) => {
    // Vincular aos projetos, tasks, finance, etc
    handleFilesSelected(files)
  }}
  multiple={true}
  accept={['application/pdf', 'image/*']} // Filtrar tipos
/>
```

---

## 🔧 SERVICES & HOOKS

### **DriveService**
`src/services/google/drive.service.ts`

```typescript
export class DriveService {
  static async listFiles(folderId?: string, search?: string) { }
  static async getFileMetadata(fileId: string) { }
  static async downloadFile(fileId: string) { }
  static async createShortcut(fileId: string, parentId?: string) { }
}
```

### **useDriveFiles Hook**
`src/hooks/use-drive-files.ts`

```typescript
export function useDriveFiles(folderId?: string) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  
  const loadFiles = async () => {
    const data = await DriveService.listFiles(folderId)
    setFiles(data.files)
  }
  
  return { files, loading, refresh: loadFiles }
}
```

---

## ⏱️ IMPLEMENTAÇÃO

### **FASE 1: Base (1-2h)**
- ✅ DriveService (métodos API)
- ✅ useDriveFiles hook
- ✅ DrivePicker dialog
- ✅ Tabelas SQL

### **FASE 2: DocsCard (1h)**
- ✅ Botão importar
- ✅ Badge Drive
- ✅ Sync docs

### **FASE 3: ProjectCard (1h)**
- ✅ Seção arquivos
- ✅ Vincular/desvincular

### **FASE 4: TaskCard (1h)**
- ✅ Aba anexos
- ✅ Indicador

### **FASE 5: FinanceCard (1h)**
- ✅ Seção comprovantes
- ✅ Indicador

**TOTAL: 5-7 horas**

---

## ✅ RESULTADO FINAL

**Como Notion:**
- Drive integrado em TUDO
- Sem componentes isolados
- Experiência fluida
- UI consistente
- Funciona onde faz sentido

**NÃO fazemos:**
- ❌ DriveCard separado
- ❌ Navegador independente
- ❌ Feature isolada

**Fazemos:**
- ✅ Drive onde já existe funcionalidade
- ✅ Integração natural
- ✅ Picker reutilizável
- ✅ UX perfeita

---

## 🚀 COMEÇAR?

Quer que eu implemente **FASE 1** agora? (Base + Picker)

Confirme! 🎯
