# 📱 Guia de Ícones PWA - ISACAR

## 📁 Arquivos Necessários

Os seguintes arquivos PNG devem ser adicionados à pasta `public/`:

| Arquivo | Tamanho | Propósito |
|---------|---------|-----------|
| `pwa-192x192.png` | 192x192 px | Ícone padrão para Android e lista de apps |
| `pwa-512x512.png` | 512x512 px | Ícone de alta resolução / Splash screen |
| `apple-touch-icon.png` | 180x180 px | Ícone para iOS (iPhone/iPad) |
| `favicon.ico` | 32x32 px | Ícone do navegador |

## 🎨 Especificações do Ícone

### Requisitos:
- **Formato**: PNG com transparência (ou fundo sólido)
- **Forma**: Quadrado (o sistema aplica máscara se necessário)
- **Área segura**: Deixe 10% de margem interna para não cortar ao aplicar máscaras
- **Cores**: Use as cores da marca ISACAR (roxo/índigo: #6366f1)

### Recomendações:
- Fundo sólido (branco ou roxo) para melhor compatibilidade
- Logo centralizado com boa margem
- Alta resolução (comece com 512x512 e reduza)

## 🛠 Como Criar os Ícones

### Opção 1: Usando Ferramentas Online (Mais Fácil)

1. **PWA Asset Generator**: https://www.pwabuilder.com/imageGenerator
   - Faça upload de uma imagem 512x512
   - Baixe todos os tamanhos gerados

2. **RealFaviconGenerator**: https://realfavicongenerator.net/
   - Upload da imagem original
   - Gera todos os formatos automaticamente

3. **Favicon.io**: https://favicon.io/
   - Converte PNG/JPG para todos os tamanhos

### Opção 2: Manualmente com Figma/Canva

1. Crie um arquivo 512x512 px
2. Adicione o logo ISACAR centralizado
3. Exporte como PNG
4. Redimensione para 192x192 e 180x180

## 📂 Estrutura Final

```
public/
├── pwa-192x192.png      ← Ícone 192x192 (Android)
├── pwa-512x512.png      ← Ícone 512x512 (HD / Splash)
├── apple-touch-icon.png ← Ícone 180x180 (iOS)
├── favicon.ico          ← Ícone 32x32 (Browser tab)
├── _redirects           ← (já existe)
└── sw-reminders.js      ← (já existe)
```

## ⚙️ Configuração já pronta

O arquivo `vite.config.ts` já está configurado:

```typescript
VitePWA({
  manifest: {
    name: 'ISACAR - Gestão de Projetos',
    short_name: 'ISACAR',
    icons: [
      { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
    ]
  }
})
```

## ✅ Checklist

- [ ] Criar `pwa-512x512.png` (512x512 px)
- [ ] Criar `pwa-192x192.png` (192x192 px)
- [ ] Criar `apple-touch-icon.png` (180x180 px)
- [ ] Criar `favicon.ico` (32x32 px)
- [ ] Colocar todos na pasta `public/`
- [ ] Fazer build: `npm run build`
- [ ] Testar instalação no Chrome/Safari

## 🧪 Como Testar

### No Chrome (Desktop):
1. Abra o app em `localhost:3005`
2. Clique no botão "Instalar App" no header
3. Selecione "Desktop"
4. O app será instalado como aplicativo

### No Chrome (Android):
1. Abra o app no navegador
2. Clique nos 3 pontos → "Adicionar à tela inicial"
3. Ou use o botão "Instalar App" → "Mobile"

### No Safari (iOS):
1. Abra o app no Safari
2. Clique no botão "Instalar App" → "Mobile"
3. Siga as instruções na tela

## 📱 Onde aparece cada ícone

| Contexto | Arquivo Usado |
|----------|---------------|
| Barra de apps Android | `pwa-192x192.png` |
| Splash screen Android | `pwa-512x512.png` |
| Tela inicial iOS | `apple-touch-icon.png` |
| Aba do navegador | `favicon.ico` |
| Instalação PWA | `pwa-512x512.png` |

## 🎯 Resultado Esperado

Após adicionar os ícones:
- ✅ Botão "Instalar App" aparece no header
- ✅ Dropdown com opções Mobile e Desktop
- ✅ Instalação funciona em todos os dispositivos
- ✅ Ícone bonito na tela inicial
- ✅ Splash screen profissional

---

*Os arquivos `pwa-192x192.png` e `pwa-512x512.png` já existem na pasta `public/` mas estão vazios (0 bytes). Substitua-os pelos ícones corretos.*
