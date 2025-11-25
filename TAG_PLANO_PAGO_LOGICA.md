# 🏷️ TAG "PLANO PAGO NECESSÁRIO" - LÓGICA

## 🎯 QUANDO A TAG APARECE:

A tag de aviso **"Plano pago necessário"** aparece SOMENTE quando:

### **Condições:**
1. ✅ **Plano do usuário é FREE** (`planType === 'free'`)
2. ✅ **Usuário JÁ adicionou 1 ou mais convites** (`invites.length >= 1`)

### **Lógica no Código:**
```typescript
const showUpgradeWarning = invites.length >= MAX_INVITES.free && planType === 'free'
// Traduzindo: invites.length >= 1 && planType === 'free'
```

---

## 📊 CENÁRIOS:

### **Cenário 1: Plano FREE + 0 convites**
```
Estado: Nenhum convite adicionado
Tag: ❌ NÃO APARECE
Motivo: Usuário ainda pode adicionar 1 convite grátis
```

### **Cenário 2: Plano FREE + 1 convite**
```
Estado: 1 convite adicionado na lista
Tag: ✅ APARECE "Plano pago necessário"
Motivo: Usuário atingiu o limite grátis (1 convite)
Ação: Não pode adicionar mais convites
Botão "+ Adicionar e-mail": DESABILITADO
```

### **Cenário 3: Plano TRIAL + 3 convites**
```
Estado: 3 convites adicionados
Tag: ❌ NÃO APARECE
Motivo: Trial permite até 5 convites
Pode adicionar: Mais 2 convites
```

### **Cenário 4: Plano PAID + 5 convites**
```
Estado: 5 convites adicionados
Tag: ❌ NÃO APARECE (mas botão desabilitado)
Motivo: Atingiu limite de 5 do plano pago
Botão "+ Adicionar e-mail": DESABILITADO
```

### **Cenário 5: Plano BUSINESS + 100 convites**
```
Estado: 100 convites adicionados
Tag: ❌ NÃO APARECE
Motivo: Business é ilimitado (999 max)
Pode adicionar: Mais 899 convites
```

---

## 🎨 VISUAL DA TAG:

```tsx
{showUpgradeWarning && (
  <div className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1">
    <Crown className="h-3.5 w-3.5 text-gray-500" />
    <span className="text-xs text-gray-600 font-medium">Plano pago necessário</span>
  </div>
)}
```

**Estilo:**
- Border: `border-gray-200`
- Background: `bg-gray-50`
- Ícone: Crown (coroa) cinza
- Texto: `text-gray-600 font-medium`
- Tamanho: `text-xs` (pequeno)
- Posição: Logo após a logo "Isacar.dev"

---

## 🔄 FLUXO DO USUÁRIO:

### **1. Usuário Abre Passo 3 (TeamInvite)**
```
- Plano: FREE (padrão)
- Convites: 0
- Tag: Não aparece
- Botão adicionar: HABILITADO
```

### **2. Usuário Digita Email e Clica "Adicionar"**
```
- Email: joao@isacar.dev
- Validação: ✅ Email válido
- Ação: Adiciona à lista
- Convites: 1
```

### **3. Tag Aparece Automaticamente**
```
- Condição: invites.length >= 1 && planType === 'free'
- Tag: ✅ "Plano pago necessário" (com ícone Crown)
- Botão adicionar: DESABILITADO
- Usuário: Não pode adicionar mais emails
```

### **4. Usuário Remove o Convite**
```
- Clica no X ao lado do email
- Convites: 0
- Tag: ❌ DESAPARECE
- Botão adicionar: HABILITADO novamente
```

---

## 🧪 COMO TESTAR:

### **Teste 1: Tag Aparece**
```typescript
1. Plano FREE (padrão novo usuário)
2. Digite: joao@isacar.dev
3. Clique: "+ Adicionar e-mail"
4. ✅ Tag deve aparecer: "Plano pago necessário"
5. ✅ Botão deve ficar desabilitado
```

### **Teste 2: Tag Desaparece**
```typescript
1. Com tag visível (1 convite adicionado)
2. Clique no X do convite
3. ❌ Tag deve desaparecer
4. ✅ Botão deve ficar habilitado
```

### **Teste 3: Múltiplos Planos**
```typescript
// Simular diferentes planos alterando no código
setPlanType('trial')  // Tag não deve aparecer até 5 convites
setPlanType('paid')   // Tag não deve aparecer até 5 convites
setPlanType('business') // Tag nunca aparece
setPlanType('free')   // Tag aparece a partir de 1 convite
```

---

## 💡 MENSAGEM PARA O USUÁRIO:

Quando a tag aparece, o usuário entende:
1. ✅ **Atingiu o limite grátis** (1 convite)
2. ✅ **Precisa fazer upgrade** para convidar mais pessoas
3. ✅ **Pode continuar** com apenas 1 convite se quiser
4. ✅ **Pode remover** o convite e adicionar outro diferente

---

## 🎯 LIMITES POR PLANO:

| Plano | Limite | Tag Aparece | Quando |
|-------|--------|-------------|--------|
| **Free** | 1 | ✅ SIM | Ao adicionar 1 convite |
| **Trial** | 5 | ❌ NÃO | Só desabilita ao atingir 5 |
| **Paid** | 5 | ❌ NÃO | Só desabilita ao atingir 5 |
| **Business** | ∞ (999) | ❌ NÃO | Nunca aparece |

---

## ✅ RESULTADO FINAL:

A tag funciona como **aviso amigável** para o usuário no plano grátis, informando que:
- ✅ Ele usou seu 1 convite grátis
- ✅ Precisa de plano pago para convidar mais pessoas
- ✅ Ainda pode continuar com apenas 1 convite
- ✅ Pode remover e adicionar outro se quiser

**Comportamento perfeito e alinhado com a imagem de referência!** 🎉
