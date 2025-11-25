# ✅ CHECKLIST - Reconectar Google Corretamente

## 🚨 **STATUS ATUAL:**
- ❌ Integração antiga deletada (scopes errados)
- ✅ Código corrigido com scopes corretos
- ✅ Logs detalhados adicionados
- ⏳ **AGUARDANDO**: Você reconectar

---

## 📋 **PASSO A PASSO (SIGA EXATAMENTE):**

### **1. Recarregar Aplicação** 🔄
```
CTRL + SHIFT + R (Windows)
CMD + SHIFT + R (Mac)
```
**Importante**: Hard reload para pegar código atualizado!

---

### **2. Abrir Console do Navegador** 🔧
```
F12 (Windows/Linux)
CMD + OPTION + I (Mac)

Clicar na aba "Console"
```

---

### **3. Ir em Settings → Integrations** ⚙️
```
Menu lateral → Settings
Clicar em "Integrations"
Seção "Google"
```

**Deve mostrar**: "Não conectado" ou "Desconectado"

---

### **4. Clicar "Conectar Google"** 🔗
1. Vai aparecer confirmação: "Conectar Google vai deslogar..."
2. Clicar **"OK"**
3. Será redirecionado para Google

---

### **5. Na Tela do Google** 🔐
**IMPORTANTE**: Aprovar TODAS as permissões!

Deve pedir permissão para:
- ✅ Ver seu email
- ✅ Ver/criar eventos no Google Calendar
- ✅ Ver/criar/editar planilhas no Google Sheets
- ✅ Ver/criar/editar arquivos no Google Drive
- ✅ Ver/criar/editar documentos no Google Docs

**Clicar em "Permitir" ou "Allow"**

---

### **6. Voltar para App** ↩️
- Aguardar redirecionamento automático
- Fazer login novamente (se necessário)
- Ir em Settings → Integrations

**Deve aparecer:**
```
✅ Status: "Conectado"
📧 Email: seu-email@gmail.com
🔓 Botão "Desconectar"
```

---

### **7. Verificar Console** 👀
No console do navegador, deve aparecer:
```
✅ Google integration saved: seu-email@gmail.com
```

**SE APARECER ERRO:**
```
❌ Token inválido: 403 - Forbidden
```
→ Significa que não aprovou todas permissões. Voltar ao passo 4.

---

### **8. Testar Export** 🧪
1. Ir em qualquer página com finanças
2. Abrir dialog "Exportar para Google Sheets"
3. Selecionar mês/ano
4. Clicar "Exportar"

---

### **9. Verificar Logs no Console** 📊
Deve aparecer:
```
📊 Tentando escrever dados no Sheets: {
  spreadsheetId: "1XxetebkXQIDbkLCn99...",
  range: "Sheet1!A1:G10",
  rows: 10,
  tokenPreview: "ya29.a0ATi6K2vC5FA..."
}

✅ Dados escritos com sucesso
```

**SE APARECER:**
```
❌ Erro do Google Sheets API: {
  status: 400,
  error: "..."
}
```
→ Copie TODA a mensagem de erro e me envie

---

### **10. Verificar Planilha Criada** 📝
- Deve abrir uma nova aba com a planilha
- Planilha deve estar no seu Google Drive
- Deve ter dados formatados (cabeçalho + linhas)

---

### **11. Ver Analytics** 📈
1. Dashboard → Card "Google Analytics"
2. Clicar "Expandir"
3. Aba "Histórico"

Deve mostrar:
```
📊 sheets | export | Sucesso ✅
   [data/hora] • [duração]ms
```

---

## ⚠️ **SE AINDA DER ERRO 400:**

### **Enviar para mim:**

1. **Screenshot do console** mostrando os logs
2. **Mensagem de erro completa** do console
3. **Email conectado** (Settings → Integrations)
4. **Status da conexão** (Conectado/Desconectado)

---

## 🔍 **COMO SABER SE SCOPES ESTÃO CORRETOS:**

Execute no console do navegador:
```javascript
// Abrir console (F12)
// Colar e executar:
fetch('https://jjeudthfiqvvauuqnezs.supabase.co/rest/v1/google_integrations?select=scopes', {
  headers: {
    'apikey': 'sua-api-key',
    'Authorization': 'Bearer ' + localStorage.getItem('supabase.auth.token')
  }
}).then(r => r.json()).then(data => console.log('Scopes:', data[0].scopes))
```

**Esperado:**
```json
[
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/documents"
]
```

**Se aparecer sem "https://"** → Scopes errados, deletar e reconectar

---

## 🎯 **RESULTADO ESPERADO:**

Após seguir TODOS os passos:

✅ Status: "Conectado" em Settings
✅ Console mostra: "Google integration saved"
✅ Export funciona sem erro 400
✅ Planilha criada no Drive
✅ Log aparece no Analytics
✅ Gráficos atualizam com dados

---

## 🚀 **COMECE AGORA:**

1. ✅ Recarregar app (Ctrl+Shift+R)
2. ✅ Abrir console (F12)
3. ✅ Settings → Integrations → Conectar Google
4. ✅ Aprovar TODAS permissões
5. ✅ Testar export
6. ✅ Ver logs no console

**Me avise quando:**
- ✅ Funcionou e criou planilha
- ❌ Deu erro (envie screenshot do console)

**BOA SORTE!** 🎉
