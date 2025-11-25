# ✅ PASSO 4 - PRICING ATUALIZADO COM COMPONENTE DA LANDING PAGE

## 🎯 MUDANÇAS REALIZADAS:

### **1. Componente PricingSection Portado**
Copiado da `lp.isacar.dev` e adaptado para TypeScript:

✅ **`src/components/ui/pricing-section.tsx`**
- PricingSection (container principal)
- PricingCard (card individual de cada plano)
- PricingFrequencyToggle (toggle Mensal/Anual)
- BorderTrail (animação de borda para card destacado)

✅ **`src/components/ui/rainbow-button.tsx`**
- Botão com gradiente animado rainbow
- Usado no card "Popular" (Pro)

### **2. CSS Atualizado**
✅ **`src/index.css`**
- Adicionadas cores CSS para rainbow: `--color-1` a `--color-5`
- Adicionada animação `@keyframes rainbow`
- Adicionada classe utilitária `.animate-rainbow`

### **3. PricingStep Reescrito**
✅ **`src/components/onboarding/steps/pricing-step.tsx`**
- Usa `<PricingSection>` da landing page
- Design horizontal completo (não mais container pequeno)
- Grid responsivo: 4 colunas desktop / 2 tablet / 1 mobile
- Cards maiores e mais espaçosos

---

## 🎨 NOVO DESIGN:

### **Layout Fullscreen Horizontal:**
```
┌──────────────────────────────────────────────────────────────┐
│                      Logo Isacar.dev                         │
│                 (com círculos coloridos)                     │
├──────────────────────────────────────────────────────────────┤
│            Escolha o plano ideal                             │
│   Comece grátis e faça upgrade quando precisar escalar      │
├──────────────────────────────────────────────────────────────┤
│          [ Mensal ]  [ Anual ] ← Toggle                      │
├──────────────────────────────────────────────────────────────┤
│ ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│ │ Grátis  │  │   Pro   │  │Business │  │Enterprise│        │
│ │         │  │ Popular │  │         │  │         │        │
│ │ Features│  │ Rainbow │  │ Features│  │ Features│        │
│ │  [Btn]  │  │ Button  │  │  [Btn]  │  │  [Btn]  │        │
│ └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
├──────────────────────────────────────────────────────────────┤
│                   [ Decidir depois ]                         │
└──────────────────────────────────────────────────────────────┘
```

### **Cards com Mais Espaço:**
- Width: 100% do grid
- Height: Auto (cresce conforme conteúdo)
- Padding: 6 (24px)
- Border radius: 2xl
- Shadow: lg → 2xl no hover
- Scale: 1.05 quando highlighted

### **Card "Pro" Destacado:**
- ✅ Border animado (BorderTrail) com gradiente colorido
- ✅ Badge "Popular" com estrela
- ✅ Background levemente destacado (`bg-muted/40`)
- ✅ **RainbowButton** com gradiente animado

---

## 💰 PLANOS (Grid de 4 Colunas):

### **Grátis (Col 1)**
```
- Preço: "Personalizado"
- Features básicas
- Botão outline
```

### **Pro (Col 2) - HIGHLIGHTED**
```
- Preço: R$ 65/mês ou R$ 624/ano
- Badge "Popular" + BorderTrail animado
- RainbowButton com gradiente
- Escala 1.05
```

### **Business (Col 3)**
```
- Preço: R$ 197/mês ou R$ 1.891/ano
- Features avançadas
- Botão outline
```

### **Enterprise (Col 4) - OPCIONAL**
```
- Adicionar se necessário no futuro
```

---

## 🔄 FUNCIONALIDADES:

### **1. Seleção de Plano:**
```typescript
onClick no card → setSelectedPlan(id)
Visual: Ring azul + Check icon
```

### **2. Toggle Mensal/Anual:**
- Animação `layoutId="frequency"` (Framer Motion)
- Background slide suave
- mix-blend-difference para contraste

### **3. Botões nos Cards:**
```typescript
Card Pro: RainbowButton (animado)
Outros: Button variant="outline"
onClick: handleSelectPlan(planId)
```

### **4. Salvar no Supabase:**
```typescript
UPDATE workspaces SET
  plan_type = 'free' | 'pro' | 'business',
  trial_ends_at = 14 dias,
  max_members = 2 | 10 | 999
```

---

## 🎭 COMPONENTES CRIADOS:

### **1. PricingSection**
```typescript
interface PricingSectionProps {
  plans: PricingPlan[]
  heading?: string
  description?: string
  onFrequencyChange?: (freq) => void
  defaultFrequency?: 'mensal' | 'anual'
}
```

### **2. PricingCard**
```typescript
interface PricingCardProps {
  plan: PricingPlan
  frequency?: 'mensal' | 'anual'
  className?: string
}
```

### **3. PricingFrequencyToggle**
```typescript
interface PricingFrequencyToggleProps {
  frequency: 'mensal' | 'anual'
  setFrequency: (freq) => void
}
```

### **4. RainbowButton**
```typescript
interface RainbowButtonProps {
  children: React.ReactNode
  className?: string
  asChild?: boolean
  onClick?: () => void
}
```

### **5. BorderTrail**
- Animação de borda colorida para card destacado
- Usa Framer Motion
- Gradiente: blue → purple → pink

---

## 📱 RESPONSIVIDADE:

### **Desktop (lg):**
```css
grid-cols-4 (até 4 planos)
max-width: 6xl (1280px)
gap: 6 (24px)
```

### **Tablet (md):**
```css
grid-cols-2
Cards maiores
```

### **Mobile:**
```css
grid-cols-1
Cards empilhados
Full width
```

---

## 🎨 ANIMAÇÕES:

### **BorderTrail (Card Pro):**
```typescript
animate: { offsetDistance: ['0%', '100%'] }
transition: { duration: 8, repeat: Infinity }
```

### **Frequency Toggle:**
```typescript
layoutId="frequency"
transition: { type: 'spring', duration: 0.4 }
```

### **Card Hover:**
```css
hover:shadow-2xl
transition-all duration-300
```

### **Card Selected:**
```css
ring-2 ring-primary
scale-105
```

---

## 🆚 ANTES vs DEPOIS:

### **ANTES:**
- ❌ Grid 3 colunas apertado
- ❌ Cards pequenos em container
- ❌ Design genérico
- ❌ Sem animações especiais
- ❌ Botão único embaixo

### **DEPOIS:**
- ✅ Grid 4 colunas horizontal completo
- ✅ Cards grandes e espaçosos
- ✅ Design da landing page profissional
- ✅ BorderTrail animado no card destacado
- ✅ RainbowButton com gradiente
- ✅ Botões individuais em cada card
- ✅ Seleção visual com ring + check
- ✅ Framer Motion em todos os elementos

---

## 📦 ARQUIVOS MODIFICADOS:

### **Criados:**
1. ✅ `src/components/ui/pricing-section.tsx` - Componente principal
2. ✅ `src/components/ui/rainbow-button.tsx` - Botão rainbow

### **Modificados:**
1. ✅ `src/index.css` - Cores e animação rainbow
2. ✅ `src/components/onboarding/steps/pricing-step.tsx` - Reescrito

### **Mantidos:**
1. ✅ `src/components/onboarding/onboarding-container.tsx` - Sem mudanças
2. ✅ `src/hooks/use-onboarding.ts` - Sem mudanças

---

## 🚀 COMO TESTAR:

1. **Recarregar app** (F5)
2. **Ir para onboarding**
3. **Passo 4 agora tem design da landing page!**
   - Cards grandes horizontalmente
   - Toggle Mensal/Anual animado
   - Card Pro com border animado
   - RainbowButton no Pro
   - Click no card → Ring azul + Check
   - Botões em cada card

---

## ✅ RESULTADO FINAL:

**O Passo 4 agora usa o componente profissional da landing page!**

- ✅ Design idêntico à página de preços
- ✅ Layout horizontal completo
- ✅ Cards grandes e espaçosos
- ✅ Animações Framer Motion
- ✅ RainbowButton gradiente
- ✅ BorderTrail no card destacado
- ✅ Grid responsivo 4/2/1 colunas
- ✅ UX profissional
- ✅ Fácil adicionar mais planos

**Pronto para produção! 🎉🚀💰**
