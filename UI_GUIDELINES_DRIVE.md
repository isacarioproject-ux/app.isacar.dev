# 🎨 UI GUIDELINES - Google Drive Integration

## ✅ REGRAS DE UI (Estilo Notion)

### **1. SEM BORDERS/CONTAINERS EXTRAS**

❌ **NÃO FAZER:**
```tsx
<div className="p-2 border rounded">
  <span>{file.name}</span>
</div>
```

✅ **FAZER:**
```tsx
<div className="p-2 hover:bg-muted/50 rounded">
  <span>{file.name}</span>
</div>
```

---

### **2. BOTÕES COM SPINNERS**

✅ **SEMPRE usar loading states:**
```tsx
<Button 
  onClick={handleImport}
  disabled={loading}
>
  {loading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Importando...
    </>
  ) : (
    <>
      <Download className="mr-2 h-4 w-4" />
      Importar do Drive
    </>
  )}
</Button>
```

---

### **3. SEM EMPTY STATES ELABORADOS**

❌ **NÃO FAZER:**
```tsx
<EmptyState 
  icon={FolderOpen}
  title="Nenhum arquivo"
  description="Faça upload ou crie um novo arquivo"
  action={{
    label: "Upload Arquivo",
    onClick: handleUpload
  }}
/>
```

✅ **FAZER (minimalista):**
```tsx
{files.length === 0 && (
  <p className="text-sm text-muted-foreground text-center py-8">
    Nenhum arquivo vinculado
  </p>
)}
```

---

### **4. LISTA DE ARQUIVOS (Sem containers)**

✅ **Layout limpo:**
```tsx
{/* SEM border, SEM Card wrapper */}
<div className="space-y-1">
  {files.map(file => (
    <motion.div
      key={file.id}
      whileHover={{ x: 4 }}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer group"
    >
      {/* Ícone */}
      <FileText className="h-4 w-4 text-muted-foreground" />
      
      {/* Nome */}
      <span className="text-sm flex-1 truncate">{file.name}</span>
      
      {/* Tamanho (subtle) */}
      <span className="text-xs text-muted-foreground">
        {formatFileSize(file.size)}
      </span>
      
      {/* Ações (aparecem no hover) */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  ))}
</div>
```

---

### **5. SEÇÃO DE ARQUIVOS NO PROJETO**

✅ **Minimalista:**
```tsx
{/* DocsCard ou ProjectCard */}
<div className="space-y-3">
  {/* Header simples */}
  <div className="flex items-center justify-between">
    <h4 className="text-sm font-medium text-muted-foreground">
      Arquivos do Drive
    </h4>
    <Button 
      variant="ghost" 
      size="sm"
      onClick={handleAddFiles}
      disabled={addingFiles}
    >
      {addingFiles ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
    </Button>
  </div>

  {/* Lista SEM border */}
  <div className="space-y-1">
    {files.map(file => (
      <div key={file.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 group">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm flex-1 truncate">{file.name}</span>
        <Button 
          variant="ghost" 
          size="icon"
          className="opacity-0 group-hover:opacity-100"
          onClick={() => removeFile(file.id)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    ))}
  </div>

  {/* Empty minimalista */}
  {files.length === 0 && (
    <p className="text-xs text-muted-foreground text-center py-4">
      Nenhum arquivo
    </p>
  )}
</div>
```

---

### **6. TASK DIALOG - ABA ANEXOS**

✅ **Clean UI:**
```tsx
<TabsContent value="attachments" className="space-y-3 pt-2">
  {/* Botão add */}
  <Button 
    variant="ghost" 
    className="w-full justify-start text-muted-foreground hover:text-foreground"
    onClick={() => setShowDrivePicker(true)}
    disabled={loading}
  >
    {loading ? (
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    ) : (
      <Paperclip className="mr-2 h-4 w-4" />
    )}
    Anexar arquivo
  </Button>

  {/* Lista limpa */}
  <div className="space-y-1">
    {attachments.map(file => (
      <div key={file.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 group">
        <FileText className="h-4 w-4 text-blue-500" />
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className="opacity-0 group-hover:opacity-100"
          onClick={() => removeAttachment(file.id)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    ))}
  </div>
</TabsContent>
```

---

### **7. DRIVE PICKER (Dialog)**

✅ **UI limpa:**
```tsx
<DialogContent className="max-w-4xl h-[600px] p-0">
  {/* Header com padding */}
  <div className="p-6 pb-4 border-b">
    <DialogTitle>Selecionar arquivos</DialogTitle>
    
    {/* Busca */}
    <div className="mt-4">
      <Input 
        placeholder="Buscar..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-9"
      />
    </div>
  </div>

  {/* Lista SEM borders extras */}
  <div className="flex-1 overflow-y-auto p-6 pt-4">
    <div className="space-y-1">
      {files.map(file => (
        <div 
          key={file.id}
          className={cn(
            "flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted/50",
            selected.includes(file) && "bg-primary/10"
          )}
          onClick={() => handleSelect(file)}
        >
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm flex-1 truncate">{file.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </span>
        </div>
      ))}
    </div>
  </div>

  {/* Footer */}
  <div className="flex items-center justify-between p-6 pt-4 border-t">
    <span className="text-sm text-muted-foreground">
      {selected.length} selecionado(s)
    </span>
    <div className="flex gap-2">
      <Button variant="ghost" onClick={onClose}>
        Cancelar
      </Button>
      <Button 
        onClick={handleConfirm}
        disabled={selected.length === 0 || confirming}
      >
        {confirming ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Selecionando...
          </>
        ) : (
          'Selecionar'
        )}
      </Button>
    </div>
  </div>
</DialogContent>
```

---

### **8. BADGES (Minimalistas)**

✅ **Subtle indicators:**
```tsx
{/* Indicador de Drive no documento */}
<Badge variant="ghost" className="text-xs gap-1">
  <Cloud className="h-3 w-3" />
  Drive
</Badge>

{/* Contador de anexos */}
<span className="text-xs text-muted-foreground flex items-center gap-1">
  <Paperclip className="h-3 w-3" />
  {count}
</span>
```

---

### **9. DROPDOWN MENUS (Clean)**

✅ **Ações contextuais:**
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button 
      variant="ghost" 
      size="icon"
      className="opacity-0 group-hover:opacity-100"
    >
      <MoreVertical className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={handleImport}>
      <Download className="mr-2 h-4 w-4" />
      Importar do Drive
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleSync}>
      <RefreshCw className="mr-2 h-4 w-4" />
      Sincronizar
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## 📋 CHECKLIST UI

Antes de criar qualquer componente:

- [ ] SEM borders desnecessários
- [ ] SEM Card wrappers extras
- [ ] Botões COM spinners
- [ ] Empty states MINIMALISTAS (só texto)
- [ ] Hover states SUTIS
- [ ] Ações aparecem no HOVER
- [ ] Badges GHOST (não outline)
- [ ] Spacing CONSISTENTE (p-2, gap-2, space-y-1)
- [ ] Text sizes CORRETOS (text-sm, text-xs)
- [ ] Colors MUTED (text-muted-foreground)

---

## ✅ RESULTADO

**Como Notion:**
- Layout limpo
- Sem poluição visual
- Ações no hover
- Feedback visual (spinners)
- Minimalista

**NÃO como antigo:**
- ❌ Borders por todo lado
- ❌ Containers desnecessários
- ❌ Empty states elaborados
- ❌ Botões sem loading

---

**AGORA SIM!** 🎯
