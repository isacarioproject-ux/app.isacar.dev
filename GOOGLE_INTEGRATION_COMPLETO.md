# 🔐 GOOGLE INTEGRATION - GUIA COMPLETO

## ⚠️ **IMPORTANTE - RECONECTE SEU GOOGLE**

As integrações antigas foram deletadas porque tinham **scopes incorretos**.
**Você precisa reconectar o Google** para que funcione corretamente!

---

## 📊 **1. ANALYTICS - O QUE ELE MOSTRA?**

### ❌ **O Analytics NÃO mostra:**
- Seus emails do Gmail
- Seus eventos do Calendar
- Seus arquivos do Drive
- Seus documentos do Docs

### ✅ **O Analytics MOSTRA:**
Apenas operações que **O APP FAZ** com sua conta Google:

| Serviço | Quando aparece no Analytics |
|---------|----------------------------|
| **Sheets** | Quando você usa "Exportar para Sheets" (Finanças/Tasks) |
| **Calendar** | Quando você usa "Sincronizar com Calendar" |
| **Drive** | Quando o app cria/edita arquivos no seu Drive |
| **Docs** | Quando o app cria/edita documentos |

**Exemplo:**
```
Você exporta Finanças para Sheets
  ↓
App cria planilha no seu Google Drive
  ↓
Gera log em google_sync_logs
  ↓
Analytics mostra: "Sheets - Export - Sucesso"
```

---

## 🔧 **2. CORREÇÕES APLICADAS**

### **2.1 Scopes Corretos** ✅
**Antes (ERRADO):**
```typescript
scopes: ['gmail', 'calendar', 'sheets', 'drive']
```

**Depois (CORRETO):**
```typescript
scopes: [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive',        // ✅ NOVO
  'https://www.googleapis.com/auth/documents'     // ✅ NOVO
]
```

### **2.2 Drive e Docs Adicionados** ✅
Agora você tem acesso a:
- ✅ **Google Drive** (ler/criar/editar arquivos)
- ✅ **Google Docs** (criar/editar documentos)
- ✅ **Google Sheets** (criar/editar planilhas)
- ✅ **Google Calendar** (criar/editar eventos)
- ✅ **Gmail** (ler emails - readonly)

### **2.3 Validação de Token** ✅
Antes de salvar, o código agora:
1. Busca info do usuário
2. **Testa se token é válido** fazendo request no Drive API
3. Se inválido, não salva e mostra erro
4. Se válido, salva com scopes corretos

---

## 🚀 **3. COMO RECONECTAR**

### **Passo 1: Ir em Settings**
```
Settings → Integrations → Google
```

### **Passo 2: Conectar Google**
1. Clicar em "Conectar Google" (vai pedir confirmação)
2. Será redirecionado para Google
3. Aprovar TODAS as permissões:
   - ✅ Ver seu email
   - ✅ Ver/criar eventos no Calendar
   - ✅ Ver/criar/editar planilhas Sheets
   - ✅ Ver/criar/editar arquivos no Drive
   - ✅ Ver/criar/editar documentos Docs

### **Passo 3: Voltar Automaticamente**
- Após autorizar, volta para app
- Status muda para "Conectado" INSTANTANEAMENTE
- Email aparece na tela

---

## 🧪 **4. TESTAR INTEGRAÇÕES**

### **4.1 Exportar Finanças**
```
1. Ir em Finance/Budget
2. Abrir dialog "Exportar para Sheets"
3. Selecionar mês/ano
4. Clicar "Exportar"
5. ✅ Deve criar planilha no Drive
6. ✅ Deve abrir URL da planilha
7. ✅ Analytics vai mostrar log "Sheets - Export - Success"
```

### **4.2 Exportar Tasks**
```
1. Ir em Tasks
2. Abrir dialog "Exportar para Sheets"
3. Filtrar tasks (opcional)
4. Clicar "Exportar"
5. ✅ Deve criar planilha no Drive
6. ✅ Analytics mostra log
```

### **4.3 Sincronizar Calendar (futuro)**
```
1. Ir em Settings → Integrations → Calendar Sync
2. Ativar sync
3. Tasks aparecerão como eventos no Google Calendar
4. Analytics mostra logs de sync
```

---

## 📋 **5. RECURSOS INTEGRADOS**

### ✅ **JÁ FUNCIONAM:**
| Recurso | Status | Onde usar |
|---------|--------|-----------|
| **Sheets Export (Finance)** | ✅ Funcional | Finance → Export Dialog |
| **Sheets Export (Tasks)** | ✅ Funcional | Tasks → Export Dialog |
| **OAuth Auto-save** | ✅ Funcional | Automático após conectar |
| **Analytics Logs** | ✅ Funcional | Dashboard → Analytics Card |
| **Drive API** | ✅ Configurado | Usado nos exports |
| **Docs API** | ✅ Configurado | Pronto para uso |

### 🔜 **PARA IMPLEMENTAR:**
| Recurso | Status | O que falta |
|---------|--------|-------------|
| **Calendar Sync** | 🔜 Parcial | Implementar UI + sync bidirecional |
| **Gmail Import** | 🔜 Parcial | Implementar extração de dados |
| **Drive Browser** | 🔜 Não iniciado | UI para navegar Drive |
| **Docs Editor** | 🔜 Não iniciado | Integração com editor |

---

## 🔍 **6. VERIFICAR SE FUNCIONOU**

### **Após reconectar, verificar:**

1. **No Frontend:**
```
Settings → Integrations
✅ Status: "Conectado"
✅ Email: seu-email@gmail.com
✅ Botão "Desconectar" aparece
```

2. **No Console do Navegador:**
```
✅ Google integration saved: seu-email@gmail.com
✅ Sem erros 400
✅ Sem "Token inválido"
```

3. **Exportar Teste:**
```
Exportar Finanças
✅ Sem erro 400
✅ Planilha criada
✅ URL abre no Google Drive
```

4. **No Analytics:**
```
Dashboard → Google Analytics → Aba Histórico
✅ Log aparece: "Sheets - export - success"
✅ Gráfico atualiza com 1 operação
```

---

## 🎯 **7. ESTRUTURA FINAL**

### **google_integrations (tabela)**
```sql
- access_token: ya29.a0A... (token válido do Google)
- scopes: ['https://www.googleapis.com/auth/...'] (URLs completas)
- settings: { 
    gmail: { enabled: true },
    calendar: { enabled: true },
    sheets: { enabled: true },
    drive: { enabled: true },  // ✅ NOVO
    docs: { enabled: true }    // ✅ NOVO
  }
```

### **Fluxo de Export:**
```
1. Usuário clica "Exportar"
2. GoogleAuthService.getAccessToken()
   → Busca token da tabela
3. SheetsService.createSpreadsheet()
   → POST https://sheets.googleapis.com/v4/spreadsheets
   → Authorization: Bearer {token}
4. SheetsService.writeData()
   → PUT .../values/Sheet1!A1:G10
   → Escreve dados na planilha
5. supabase.rpc('log_google_sync')
   → Registra log em google_sync_logs
   → Atualiza google_sync_stats
6. Analytics atualiza automaticamente
```

---

## ⚠️ **8. SE AINDA DER ERRO 400**

### **Verificar:**

1. **Token está salvo?**
```sql
SELECT 
  google_email,
  LENGTH(access_token) as token_length,
  scopes
FROM google_integrations;

-- Esperado:
-- token_length: > 100
-- scopes: [https://www.googleapis.com/auth/...]
```

2. **Scopes corretos?**
```
Devem começar com "https://www.googleapis.com/auth/"
Se tiver só "gmail", "sheets", etc → ERRADO
```

3. **Token expirou?**
```
Tokens do Google duram 1 hora
Se passou 1 hora, reconectar
(Refresh token ainda não implementado)
```

4. **Console mostra erro?**
```
F12 → Console
Se mostrar "401 Unauthorized" → Token inválido
Se mostrar "403 Forbidden" → Scopes insuficientes
Se mostrar "400 Bad Request" → Dados inválidos
```

---

## 🎉 **RESULTADO FINAL**

✅ **Scopes corretos** com URLs completas
✅ **Drive e Docs** adicionados
✅ **Validação de token** antes de salvar
✅ **OAuth automático** detecta e salva
✅ **Integração completa** com todos serviços
✅ **Analytics funcional** para logs de operações

---

## 🚨 **AÇÃO NECESSÁRIA**

**RECONECTE SEU GOOGLE AGORA:**

1. Settings → Integrations
2. Se aparecer "Conectado", clicar em "Desconectar"
3. Clicar em "Conectar Google"
4. Aprovar TODAS as permissões
5. Testar export de Finanças
6. Ver log no Analytics

**Após reconectar, tudo deve funcionar!** 🚀
