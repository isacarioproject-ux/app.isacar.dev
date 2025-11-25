# Sistema de Compartilhamento de Projetos

## 📋 Visão Geral

Sistema que permite compartilhar pastas/projetos com membros específicos do workspace colaborativo, mesmo quando o usuário está no workspace pessoal.

## 🎯 Fluxo de Uso

### 1. Usuário no Workspace Pessoal

```
Workspace Pessoal
    ↓
Cria Projeto/Documento
    ↓
Ativa "Tornar privado"
    ↓
Aparece "Compartilhar apenas com"
    ↓
Seleciona membros do Workspace Colaborativo
    ↓
Projeto compartilhado apenas com membros selecionados
```

### 2. Casos de Uso

**Exemplo 1 - Sócio Co-fundador:**
- Tenho 5 membros no workspace colaborativo
- Crio projeto sensível
- Compartilho apenas com meu sócio (1 membro)
- Outros 4 membros NÃO veem o projeto

**Exemplo 2 - Equipe de Desenvolvimento:**
- Tenho 5 membros no workspace
- Crio projeto de desenvolvimento
- Compartilho com 3 desenvolvedores específicos
- Esses 3 podem ver e colaborar
- 1 sócio não tem acesso
- Tarefas integradas ficam restritas aos mesmos 3

## 🔧 Componentes

### 1. `create-project-dialog.tsx`

**Estado:**
```typescript
const [isPrivate, setIsPrivate] = useState(false)
const [sharedMembers, setSharedMembers] = useState<string[]>([])
```

**UI Responsiva:**
- Desktop: Dialog normal (480px)
- Mobile: Full screen com bordas arredondadas

**Configurações:**
- **Status:** Abre StatusDialog (Drawer mobile / Dialog desktop)
- **Tornar privado:** Switch que mostra/oculta compartilhamento
- **Compartilhar apenas com:** Só aparece quando `isPrivate = true`

### 2. `share-members-selector.tsx`

**Responsividade:**
- **Mobile:** Drawer (desliza de baixo)
- **Desktop:** Popover (300px)

**Funcionalidades:**
- ✅ Input de busca (filtra por nome, email, role)
- ✅ Lista de membros com avatares
- ✅ Checkbox para seleção múltipla
- ✅ Badge "Você" no usuário atual
- ✅ Check visual nos selecionados
- ✅ Usuário atual não pode ser desmarcado
- ✅ Contador de membros selecionados
- ✅ Animações suaves
- ✅ Handle visual no drawer (arrastar para fechar)

**Mock Data:**
```typescript
const MOCK_MEMBERS = [
  { id: '1', name: 'Eu', email: 'isacar.dev@gmail.com', role: 'Proprietário' },
  { id: '2', name: 'João Silva', email: 'joao@empresa.com', role: 'Co-fundador' },
  // ... 8 membros no total
]
```

### 3. `status-dialog.tsx`

**Responsividade:**
- **Mobile:** Drawer sem header (só handle visual)
- **Desktop:** Dialog com header completo

**Status Disponíveis:**
- 🕐 PENDENTE (Not started)
- ⏳ EM PROGRESSO (Active)
- ✅ CONCLUÍDO (Closed)

## 💅 UX/UI

### Visual Cards de Configuração

```
┌─────────────────────────────────────┐
│ 🕐  Status                      >   │ <- hover: borda suave
│     EM PROGRESSO                    │
├─────────────────────────────────────┤
│ 🔒  Tornar privado             [⚪] │ <- switch
├─────────────────────────────────────┤
│ 👥  Compartilhar apenas com         │ <- só se isPrivate
│     2 membros selecionados  JS MS   │ <- avatars stack
└─────────────────────────────────────┘
```

### Popover/Drawer de Membros

```
Mobile (Drawer):                Desktop (Popover):
┌────────────────┐              ┌─────────────────────┐
│    ──────      │ <- handle    │ Compartilhar com... │
│                │              ├─────────────────────┤
│ 🔍 Buscar...   │              │ 🔍 Buscar...        │
├────────────────┤              ├─────────────────────┤
│ EU  Você   [ ] │ <- disabled  │ 👤 João Silva   [✓] │
│ JS  João   [✓] │              │ 👤 Maria Santos [✓] │
│ MS  Maria  [✓] │              │ 👤 Pedro Costa  [ ] │
│ PC  Pedro  [ ] │              ├─────────────────────┤
│ ...            │              │ 2 membros selecion. │
└────────────────┘              │ ℹ️ Workspace info   │
                                └─────────────────────┘
```

### Avatars Stack

```
[JS] [MS] [PC] [+2]  <- Até 3 avatares + contador
```

## 🎨 Animações

- **Slide in:** Campo "Compartilhar" aparece suavemente
- **Scale on hover:** Avatares aumentam ao passar mouse
- **Fade in:** ChevronRight fica mais visível no hover
- **Stagger:** Lista de membros com delay incremental
- **Check bounce:** Check mark com spring animation

## 📱 Responsividade

### Mobile
- Dialog full screen
- Drawer desliza de baixo
- Handle visual para fechar
- Inputs e avatares ajustados

### Desktop
- Dialog 480px
- Popover 340px
- Hover states refinados
- Melhor uso de espaço

## 🔄 Integrações Futuras

### Com Banco de Dados

```typescript
// Buscar membros do workspace colaborativo
const { data: members } = await supabase
  .from('workspace_members')
  .select('*, users(*)')
  .eq('workspace_id', collaborativeWorkspaceId)
  .eq('status', 'active')

// Salvar projeto com compartilhamento
const { data: project } = await supabase
  .from('projects')
  .insert({
    name,
    workspace_id: workspaceId, // null se pessoal
    is_private: isPrivate,
    created_by: userId
  })

// Salvar permissões de compartilhamento
if (isPrivate && sharedMembers.length > 0) {
  await supabase
    .from('project_members')
    .insert(
      sharedMembers.map(memberId => ({
        project_id: project.id,
        user_id: memberId,
        role: 'viewer' // ou 'editor'
      }))
    )
}
```

### Com Tasks/Documents

Quando projeto é compartilhado:
- Tasks dentro do projeto herdam permissões
- Documentos linkados ficam restritos
- Notificações apenas para membros compartilhados

## 🎯 Próximos Passos

1. ✅ UI/UX completo
2. ⏳ Integração com banco de dados
3. ⏳ Sistema de permissões (viewer/editor/admin)
4. ⏳ Notificações de compartilhamento
5. ⏳ Auditoria de acesso
6. ⏳ Compartilhamento em massa
7. ⏳ Links de convite temporários

## 🔐 Segurança

- Validar permissões no backend
- Row Level Security (RLS) no Supabase
- Logs de auditoria
- Revogação de acesso
- Expiração de permissões (opcional)

---

**Status:** ✅ UI/UX Completo | ⏳ Aguardando integração com banco de dados
