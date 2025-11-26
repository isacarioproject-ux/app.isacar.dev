# 🔍 ISACAR - SEO Strategy & Guidelines

## Estratégia de SEO para Landing Page

---

## 1. Palavras-Chave Principais

### 1.1 Primary Keywords
| Keyword | Volume | Dificuldade | Intenção |
|---------|--------|-------------|----------|
| gestão de projetos | 12.100 | Alta | Informacional |
| controle financeiro | 8.100 | Média | Transacional |
| gerenciador de tarefas | 5.400 | Média | Transacional |
| software de gestão | 4.400 | Alta | Transacional |
| kanban online | 2.900 | Baixa | Transacional |

### 1.2 Long-Tail Keywords
| Keyword | Volume | Dificuldade |
|---------|--------|-------------|
| software de gestão de projetos grátis | 1.600 | Baixa |
| controle financeiro para empresas | 880 | Média |
| ferramenta de gestão de equipe | 720 | Baixa |
| gerenciador de projetos e finanças | 320 | Baixa |
| aplicativo para gerenciar tarefas e dinheiro | 210 | Baixa |
| plataforma de gestão para freelancers | 170 | Baixa |
| software gestão pequenas empresas | 590 | Média |

### 1.3 LSI Keywords (Semânticas)
- produtividade
- organização pessoal
- planejamento financeiro
- fluxo de caixa
- orçamento empresarial
- colaboração online
- trabalho remoto
- metodologia ágil
- scrum
- equipe distribuída

---

## 2. Meta Tags Otimizadas

### 2.1 Homepage
```html
<title>ISACAR - Gestão de Projetos e Finanças em Um Só Lugar | Teste Grátis</title>
<meta name="description" content="Gerencie projetos, controle finanças e colabore com sua equipe usando o ISACAR. Software de gestão completo com Kanban, orçamentos e integração Google. 14 dias grátis!">
<meta name="keywords" content="gestão de projetos, controle financeiro, gerenciador de tarefas, kanban, software de gestão, saas, organização empresarial">
<link rel="canonical" href="https://isacar.dev/">
```

### 2.2 Página de Features
```html
<title>Funcionalidades do ISACAR - Tarefas, Finanças, Equipe e Mais</title>
<meta name="description" content="Conheça as funcionalidades do ISACAR: gestão de tarefas com Kanban, controle financeiro completo, colaboração de equipe, integração com Google Workspace e mais.">
```

### 2.3 Página de Preços
```html
<title>Preços e Planos do ISACAR - Comece Grátis Hoje</title>
<meta name="description" content="Escolha o plano ideal para sua empresa. Plano gratuito disponível, Pro a partir de R$29/mês. Sem taxas ocultas, cancele quando quiser.">
```

### 2.4 Página de Integrações
```html
<title>Integrações ISACAR - Google Workspace, Gmail, Calendar e Mais</title>
<meta name="description" content="ISACAR integra com Google Workspace: importe boletos do Gmail, sincronize tarefas com Calendar, exporte relatórios para Sheets. Conecte suas ferramentas favoritas.">
```

---

## 3. Structured Data (Schema.org)

### 3.1 Organization Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "ISACAR",
  "url": "https://isacar.dev",
  "logo": "https://isacar.dev/logo.png",
  "sameAs": [
    "https://twitter.com/isacar_dev",
    "https://linkedin.com/company/isacar",
    "https://github.com/isacar"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+55-11-99999-9999",
    "contactType": "customer service",
    "availableLanguage": ["Portuguese", "English", "Spanish"]
  }
}
```

### 3.2 SoftwareApplication Schema
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ISACAR",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web, iOS, Android",
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "0",
    "highPrice": "99",
    "priceCurrency": "BRL",
    "offerCount": "3"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "256"
  }
}
```

### 3.3 FAQ Schema
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "O ISACAR tem plano grátis?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sim! O ISACAR oferece um plano gratuito com funcionalidades básicas, além de 14 dias de trial do plano Pro sem necessidade de cartão de crédito."
      }
    },
    {
      "@type": "Question",
      "name": "O ISACAR funciona offline?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sim! O ISACAR é um Progressive Web App (PWA) que permite uso offline. Suas alterações são sincronizadas automaticamente quando você voltar a ficar online."
      }
    },
    {
      "@type": "Question",
      "name": "Quais integrações o ISACAR oferece?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "O ISACAR integra com Google Workspace (Gmail, Calendar, Sheets, Drive), permitindo importar boletos, sincronizar tarefas e exportar relatórios automaticamente."
      }
    }
  ]
}
```

### 3.4 BreadcrumbList Schema
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://isacar.dev"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Features",
      "item": "https://isacar.dev/features"
    }
  ]
}
```

---

## 4. Open Graph & Social

### 4.1 Open Graph Tags
```html
<meta property="og:type" content="website">
<meta property="og:url" content="https://isacar.dev/">
<meta property="og:title" content="ISACAR - Gestão de Projetos e Finanças">
<meta property="og:description" content="Gerencie projetos, controle finanças e colabore com sua equipe em uma única plataforma.">
<meta property="og:image" content="https://isacar.dev/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="pt_BR">
<meta property="og:locale:alternate" content="en_US">
<meta property="og:locale:alternate" content="es_ES">
<meta property="og:site_name" content="ISACAR">
```

### 4.2 Twitter Cards
```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@isacar_dev">
<meta name="twitter:creator" content="@isacar_dev">
<meta name="twitter:title" content="ISACAR - Gestão Inteligente">
<meta name="twitter:description" content="Projetos, finanças e equipe em um só lugar.">
<meta name="twitter:image" content="https://isacar.dev/twitter-card.png">
```

---

## 5. Technical SEO

### 5.1 robots.txt
```
User-agent: *
Allow: /

Sitemap: https://isacar.dev/sitemap.xml

# Block admin and API routes
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Disallow: /settings/
```

### 5.2 sitemap.xml Structure
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://isacar.dev/</loc>
    <lastmod>2025-01-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://isacar.dev/features</loc>
    <lastmod>2025-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://isacar.dev/pricing</loc>
    <lastmod>2025-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://isacar.dev/integrations</loc>
    <lastmod>2025-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://isacar.dev/blog</loc>
    <lastmod>2025-01-01</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
```

### 5.3 Core Web Vitals Targets
| Métrica | Target | Atual |
|---------|--------|-------|
| LCP | < 2.5s | - |
| FID | < 100ms | - |
| CLS | < 0.1 | - |
| TTFB | < 800ms | - |
| FCP | < 1.8s | - |

### 5.4 Image Optimization
```markdown
- Usar WebP com fallback PNG/JPG
- Lazy loading para imagens abaixo da fold
- Dimensões explícitas (width/height)
- Alt text descritivo para todas as imagens
- Compressão sem perda de qualidade (TinyPNG/ImageOptim)
- CDN para assets estáticos (Cloudflare)
```

---

## 6. Content Strategy

### 6.1 Blog Topics
| Categoria | Tópicos |
|-----------|---------|
| Produtividade | "10 Dicas para Organizar suas Tarefas" |
| Finanças | "Como Controlar o Fluxo de Caixa da Empresa" |
| Gestão | "Metodologias Ágeis para Pequenas Empresas" |
| Tutoriais | "Como Usar o ISACAR para Gerenciar Projetos" |
| Cases | "Como a Empresa X Aumentou sua Produtividade em 50%" |

### 6.2 Content Calendar
| Semana | Tipo | Título |
|--------|------|--------|
| 1 | Blog | "Guia Completo de Gestão de Projetos para Iniciantes" |
| 2 | Tutorial | "Como Importar Boletos do Gmail Automaticamente" |
| 3 | Case | "Como Freelancers Usam o ISACAR" |
| 4 | Comparativo | "ISACAR vs Trello vs Asana: Qual Escolher?" |

### 6.3 Link Building Strategy
- Guest posts em blogs de produtividade
- Parcerias com influencers de business
- Menções em diretórios de SaaS (G2, Capterra)
- Participação em fóruns (Reddit, ProductHunt)
- Press releases para lançamentos

---

## 7. Local SEO (Se Aplicável)

### 7.1 Google Business Profile
```yaml
Nome: ISACAR - Software de Gestão
Categoria: Empresa de Software
Endereço: São Paulo, SP, Brasil
Telefone: +55 11 99999-9999
Website: https://isacar.dev
Horário: 24/7 (SaaS)
```

---

## 8. Monitoring & Tools

### 8.1 Ferramentas Recomendadas
| Ferramenta | Uso |
|------------|-----|
| Google Search Console | Indexação, erros, performance |
| Google Analytics 4 | Tráfego, conversões |
| Ahrefs / SEMrush | Backlinks, keywords |
| Screaming Frog | Auditoria técnica |
| PageSpeed Insights | Core Web Vitals |
| Hotjar | Comportamento do usuário |

### 8.2 KPIs de SEO
| Métrica | Meta Q1 | Meta Q2 |
|---------|---------|---------|
| Organic Sessions | 5.000 | 15.000 |
| Keywords Top 10 | 20 | 50 |
| Domain Rating | 20 | 35 |
| Backlinks | 50 | 150 |
| CTR Orgânico | 3% | 5% |

---

## 9. Checklist de SEO

### On-Page
- [ ] Title tags otimizadas (50-60 chars)
- [ ] Meta descriptions únicas (150-160 chars)
- [ ] H1 único por página
- [ ] Hierarquia de headings (H1 > H2 > H3)
- [ ] Alt text em todas as imagens
- [ ] URLs amigáveis e curtas
- [ ] Internal linking estratégico
- [ ] Schema markup implementado

### Technical
- [ ] SSL/HTTPS ativo
- [ ] sitemap.xml gerado
- [ ] robots.txt configurado
- [ ] Canonical tags corretas
- [ ] Hreflang para multilíngue
- [ ] Mobile-friendly
- [ ] Core Web Vitals otimizados
- [ ] 404 page customizada

### Off-Page
- [ ] Google Search Console verificado
- [ ] Google Analytics configurado
- [ ] Social profiles criados
- [ ] Google Business Profile (se aplicável)
- [ ] Backlinks de qualidade
- [ ] Menções em diretórios

---

**Documento SEO - ISACAR**
*Última atualização: Novembro 2025*
