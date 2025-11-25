# 🧪 TESTE CALENDAR SYNC

## Como testar a sincronização com Google Calendar:

### PASSO 1: Criar Task de Teste

Vá em **Tasks** e crie uma task com:
- ✅ **Título**: "Reunião com cliente"
- ✅ **Data Início**: Hoje
- ✅ **Data Fim**: Amanhã (IMPORTANTE!)
- ✅ **Descrição**: "Testar sincronização Calendar"

### PASSO 2: Ver a Task no Calendar Sync

1. Volte para **Settings → Integrations**
2. Role até **"Sincronizar com Google Calendar"**
3. ✅ Você verá:
   - **1 task com data**
   - **0 sincronizadas**
   - **1 pendente**

### PASSO 3: Sincronizar

1. Clique no botão **"Sincronizar Tudo"** (agora estará ativo!)
2. ✅ Task será enviada para o Google Calendar
3. ✅ Status muda para "Sincronizada"

### PASSO 4: Verificar no Google Calendar

1. Abra seu Google Calendar
2. ✅ Evento "Reunião com cliente" aparece na data!

---

## 📊 ESTATÍSTICAS:

O card mostra:
- **Tasks com data**: Total de tasks com due_date
- **Sincronizadas**: Tasks que têm calendar_event_id
- **Pendentes**: Diferença entre total e sincronizadas

---

## 💡 DICA:

O switch **"Auto-sync"** não faz nada ainda (futuro: sync automático ao criar task).

Por enquanto, use o botão **"Sincronizar Tudo"** para sync manual!
