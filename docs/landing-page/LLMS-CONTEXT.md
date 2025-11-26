# 🤖 ISACAR - LLM Context Document

## Context for AI/LLM Code Generation

Este documento contém todas as informações necessárias para que uma IA/LLM gere código para a landing page do ISACAR.

---

## 1. Project Overview

```yaml
name: ISACAR
type: SaaS Landing Page
description: Landing page para plataforma de gestão de projetos e finanças
target_audience: 
  - Freelancers
  - Startups
  - Pequenas empresas (5-50 funcionários)
  - Agências digitais
primary_language: Portuguese (Brazil)
secondary_languages: [English, Spanish]
```

---

## 2. Tech Stack Specification

```json
{
  "framework": "Next.js 14",
  "router": "App Router",
  "language": "TypeScript",
  "styling": {
    "primary": "TailwindCSS",
    "components": "shadcn/ui",
    "animations": "Framer Motion"
  },
  "icons": "Lucide Icons",
  "fonts": {
    "primary": "Inter",
    "fallback": "system-ui, sans-serif"
  },
  "forms": {
    "validation": "Zod",
    "handling": "React Hook Form"
  },
  "package_manager": "pnpm",
  "deployment": "Vercel"
}
```

---

## 3. Design Tokens

### 3.1 Colors
```css
:root {
  /* Primary - Indigo */
  --primary-50: #eef2ff;
  --primary-100: #e0e7ff;
  --primary-500: #6366f1;
  --primary-600: #4f46e5;
  --primary-700: #4338ca;
  
  /* Secondary - Emerald */
  --secondary-500: #10b981;
  --secondary-600: #059669;
  
  /* Accent - Amber */
  --accent-500: #f59e0b;
  --accent-600: #d97706;
  
  /* Neutral */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-500: #6b7280;
  --gray-900: #111827;
  
  /* Semantic */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
  
  /* Background */
  --background: #ffffff;
  --background-dark: #0f172a;
}
```

### 3.2 Typography
```css
/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
--text-6xl: 3.75rem;   /* 60px */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### 3.3 Spacing
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### 3.4 Breakpoints
```css
--screen-sm: 640px;
--screen-md: 768px;
--screen-lg: 1024px;
--screen-xl: 1280px;
--screen-2xl: 1536px;
```

---

## 4. Component Specifications

### 4.1 Navbar Component
```typescript
interface NavbarProps {
  logo: ReactNode;
  links: Array<{
    label: string;
    href: string;
  }>;
  cta: {
    label: string;
    href: string;
  };
  sticky?: boolean;
  transparent?: boolean;
}

// Links structure
const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Preços", href: "#pricing" },
  { label: "Integrações", href: "#integrations" },
  { label: "Blog", href: "/blog" },
];
```

### 4.2 Hero Section
```typescript
interface HeroProps {
  headline: string;
  subheadline: string;
  primaryCTA: {
    label: string;
    href: string;
  };
  secondaryCTA: {
    label: string;
    href: string;
  };
  trustBadges: string[];
  heroImage: string;
}

// Content
const heroContent = {
  headline: "Gerencie Projetos, Finanças e Equipe em Um Só Lugar",
  subheadline: "A plataforma inteligente que combina gestão de tarefas, controle financeiro e colaboração para impulsionar seu negócio.",
  primaryCTA: { label: "Começar Grátis", href: "/register" },
  secondaryCTA: { label: "Ver Demo", href: "#demo" },
  trustBadges: [
    "14 dias grátis",
    "Sem cartão de crédito",
    "Cancele quando quiser"
  ]
};
```

### 4.3 Features Section
```typescript
interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: CheckSquare,
    title: "Gestão de Tarefas",
    description: "Kanban, subtasks, comentários, prazos e prioridades em um só lugar.",
    color: "blue"
  },
  {
    icon: DollarSign,
    title: "Controle Financeiro",
    description: "Receitas, despesas, orçamentos e relatórios para sua empresa.",
    color: "green"
  },
  {
    icon: Users,
    title: "Colaboração de Equipe",
    description: "Workspaces, convites, permissões e colaboração em tempo real.",
    color: "purple"
  },
  {
    icon: BarChart3,
    title: "Analytics & Relatórios",
    description: "Dashboards personalizáveis, gráficos e métricas de produtividade.",
    color: "orange"
  }
];
```

### 4.4 Pricing Section
```typescript
interface PricingPlan {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    name: "Free",
    price: 0,
    period: "para sempre",
    description: "Para começar a organizar",
    features: [
      "1 usuário",
      "3 projetos",
      "Tarefas ilimitadas",
      "Controle financeiro básico"
    ],
    cta: "Começar Grátis"
  },
  {
    name: "Pro",
    price: 29,
    period: "por mês",
    description: "Para profissionais e equipes",
    features: [
      "5 usuários",
      "Projetos ilimitados",
      "Integrações Google",
      "Relatórios avançados",
      "Suporte prioritário"
    ],
    cta: "Começar Trial",
    popular: true
  },
  {
    name: "Business",
    price: 99,
    period: "por mês",
    description: "Para empresas em crescimento",
    features: [
      "Usuários ilimitados",
      "API access",
      "SSO / SAML",
      "Audit logs",
      "Account manager",
      "SLA garantido"
    ],
    cta: "Falar com Vendas"
  }
];
```

### 4.5 Testimonials Section
```typescript
interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    quote: "O ISACAR transformou a forma como gerenciamos nossos projetos. Economizamos mais de 10 horas por semana!",
    author: "João Silva",
    role: "CEO",
    company: "Startup X",
    avatar: "/avatars/joao.jpg",
    rating: 5
  },
  {
    quote: "Finalmente encontrei uma ferramenta que combina gestão de projetos e finanças. Perfeito para freelancers!",
    author: "Maria Costa",
    role: "Designer Freelancer",
    company: "Autônoma",
    avatar: "/avatars/maria.jpg",
    rating: 5
  },
  {
    quote: "A integração com Google Workspace é incrível. Importar boletos do Gmail automaticamente mudou minha vida.",
    author: "Carlos Mendes",
    role: "CFO",
    company: "Tech Solutions",
    avatar: "/avatars/carlos.jpg",
    rating: 5
  }
];
```

### 4.6 FAQ Section
```typescript
interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "Posso testar o ISACAR gratuitamente?",
    answer: "Sim! Oferecemos 14 dias de trial do plano Pro sem necessidade de cartão de crédito. Além disso, temos um plano gratuito permanente com funcionalidades básicas."
  },
  {
    question: "O ISACAR funciona offline?",
    answer: "Sim! O ISACAR é um Progressive Web App (PWA) que permite uso offline. Suas alterações são sincronizadas automaticamente quando você voltar a ficar online."
  },
  {
    question: "Quais integrações estão disponíveis?",
    answer: "Atualmente integramos com Google Workspace (Gmail, Calendar, Sheets, Drive). Novas integrações como Slack, Notion e Zapier estão no roadmap."
  },
  {
    question: "Meus dados estão seguros?",
    answer: "Sim! Usamos Supabase com Row-Level Security (RLS), criptografia em trânsito e em repouso, além de backups automáticos diários."
  },
  {
    question: "Posso cancelar minha assinatura?",
    answer: "Sim, você pode cancelar a qualquer momento sem multas ou taxas. Seus dados ficam disponíveis por 30 dias após o cancelamento."
  },
  {
    question: "Vocês oferecem suporte em português?",
    answer: "Sim! Nosso suporte é 100% em português, com atendimento via chat, email e para planos Business, account manager dedicado."
  }
];
```

### 4.7 CTA Section
```typescript
interface CTAProps {
  headline: string;
  subheadline: string;
  primaryCTA: {
    label: string;
    href: string;
  };
  newsletter?: {
    placeholder: string;
    buttonLabel: string;
  };
}

const ctaContent: CTAProps = {
  headline: "Pronto para transformar sua gestão?",
  subheadline: "Junte-se a mais de 1.000 empresas que já usam o ISACAR para crescer.",
  primaryCTA: { label: "Começar Grátis Agora", href: "/register" },
  newsletter: {
    placeholder: "seu@email.com",
    buttonLabel: "Receber Dicas"
  }
};
```

### 4.8 Footer
```typescript
interface FooterSection {
  title: string;
  links: Array<{
    label: string;
    href: string;
  }>;
}

const footerSections: FooterSection[] = [
  {
    title: "Produto",
    links: [
      { label: "Features", href: "/features" },
      { label: "Preços", href: "/pricing" },
      { label: "Integrações", href: "/integrations" },
      { label: "Roadmap", href: "/roadmap" },
      { label: "Changelog", href: "/changelog" }
    ]
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Carreiras", href: "/careers" },
      { label: "Contato", href: "/contact" }
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Termos de Uso", href: "/terms" },
      { label: "Privacidade", href: "/privacy" },
      { label: "Cookies", href: "/cookies" },
      { label: "LGPD", href: "/lgpd" }
    ]
  },
  {
    title: "Social",
    links: [
      { label: "Twitter", href: "https://twitter.com/isacar_dev" },
      { label: "LinkedIn", href: "https://linkedin.com/company/isacar" },
      { label: "GitHub", href: "https://github.com/isacar" },
      { label: "YouTube", href: "https://youtube.com/@isacar" }
    ]
  }
];
```

---

## 5. Animation Guidelines

### 5.1 Framer Motion Variants
```typescript
// Fade In Up
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

// Stagger Children
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Scale on Hover
const scaleOnHover = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 }
};

// Slide In from Left
const slideInLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5 }
};

// Float Animation
const floatAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};
```

### 5.2 Scroll Animations
```typescript
// Use Framer Motion's useScroll and useTransform
// Animate elements as they enter viewport
// Use IntersectionObserver for performance
```

---

## 6. Page Structure

### 6.1 File Structure
```
landing/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── (routes)/
│       ├── features/
│       ├── pricing/
│       ├── integrations/
│       └── blog/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Integrations.tsx
│   │   ├── Testimonials.tsx
│   │   ├── Pricing.tsx
│   │   ├── FAQ.tsx
│   │   └── CTA.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── common/
│       ├── Logo.tsx
│       └── Button.tsx
├── lib/
│   ├── utils.ts
│   └── constants.ts
├── public/
│   ├── images/
│   └── icons/
└── styles/
    └── globals.css
```

### 6.2 Page Layout
```tsx
// app/page.tsx
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Integrations />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
```

---

## 7. SEO Implementation

### 7.1 Metadata
```typescript
// app/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'ISACAR - Gestão de Projetos e Finanças',
    template: '%s | ISACAR'
  },
  description: 'Gerencie projetos, controle finanças e colabore com sua equipe em uma única plataforma. Teste grátis por 14 dias!',
  keywords: ['gestão de projetos', 'controle financeiro', 'SaaS', 'kanban'],
  authors: [{ name: 'ISACAR' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://isacar.dev',
    siteName: 'ISACAR',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ISACAR - Gestão Inteligente'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@isacar_dev'
  },
  robots: {
    index: true,
    follow: true
  }
};
```

---

## 8. Performance Requirements

```yaml
Lighthouse Scores:
  Performance: > 90
  Accessibility: > 95
  Best Practices: > 95
  SEO: > 95

Core Web Vitals:
  LCP: < 2.5s
  FID: < 100ms
  CLS: < 0.1

Bundle Size:
  First Load JS: < 100KB
  Total Page Size: < 500KB
```

---

## 9. Generation Instructions

### Para LLMs gerarem a landing page:

1. **Use Next.js 14 App Router** com TypeScript
2. **Styling com TailwindCSS** - use classes utilitárias
3. **Componentes shadcn/ui** - Button, Card, Accordion, etc
4. **Animações com Framer Motion** - use motion components
5. **Ícones com Lucide React** - import específico
6. **Responsividade** - mobile-first approach
7. **Acessibilidade** - ARIA labels, semântica HTML5
8. **Performance** - lazy loading, otimização de imagens

### Exemplo de Componente Hero:
```tsx
'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary-50 to-white">
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Gerencie Projetos, Finanças e Equipe em{' '}
            <span className="text-primary-600">Um Só Lugar</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A plataforma inteligente que combina gestão de tarefas, 
            controle financeiro e colaboração para impulsionar seu negócio.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="gap-2">
              Começar Grátis
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <Play className="h-4 w-4" />
              Ver Demo
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <span>✓ 14 dias grátis</span>
            <span>✓ Sem cartão</span>
            <span>✓ Cancele quando quiser</span>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16"
        >
          <Image
            src="/dashboard-preview.png"
            alt="ISACAR Dashboard"
            width={1200}
            height={675}
            className="rounded-lg shadow-2xl mx-auto"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
}
```

---

## 10. Assets Required

```markdown
- Logo SVG (dark/light versions)
- Favicon set (16x16, 32x32, apple-touch-icon)
- OG Image (1200x630)
- Dashboard screenshot (1920x1080)
- Mobile screenshots (375x812)
- Feature icons (SVG)
- Integration logos (Google, Gmail, etc)
- Testimonial avatars
- Background patterns/gradients
```

---

**Este documento foi criado para ser lido por LLMs e gerar código automaticamente.**

*ISACAR - Novembro 2025*
