# 🐛 DEBUG - Erro 400 nas Queries

## O que está acontecendo:

As queries estão falhando com erro 400, mas não sabemos o motivo exato.

## Possíveis causas:

### 1. **RLS (Row Level Security)**
- O Supabase pode estar bloqueando acesso a certas colunas
- Solução: Verificar policies no Supabase

### 2. **Colunas inexistentes**
- Talvez `calendar_event_id` não exista na tabela tasks
- Solução: Verificar schema no Supabase

### 3. **Sintaxe da query**
- Algo ainda está errado na sintaxe
- Solução: Simplificar ainda mais

---

## 🔧 Teste Manual no Console:

Abra o Console (F12) e cole isso:

```javascript
// Teste 1: Query mais simples possível
const { data, error } = await supabase
  .from('tasks')
  .select('id, title')
  .limit(5)

console.log('Teste 1:', { data, error })

// Teste 2: Adicionar due_date
const { data: data2, error: error2 } = await supabase
  .from('tasks')
  .select('id, title, due_date')
  .limit(5)

console.log('Teste 2:', { data: data2, error: error2 })

// Teste 3: Adicionar filtro
const { data: { user } } = await supabase.auth.getUser()
const { data: data3, error: error3 } = await supabase
  .from('tasks')
  .select('id, title, due_date')
  .eq('user_id', user.id)
  .limit(5)

console.log('Teste 3:', { data: data3, error: error3 })
```

---

## 📊 Me envie o resultado!

Depois de rodar esses testes, me envie o output completo que aparece no console.

Isso vai me dizer exatamente onde está o problema.
