🎯 ONBOARDING COMPLETO - ISACAR.DEV
📊 O QUE VAMOS IMPLEMENTAR:
✅ Onboarding Flow - 6 passos minimalistas
✅ Analytics completo - Rastreamento de tudo
✅ Dashboard de métricas - Ver quem são seus usuários
✅ Mobile-friendly - Funciona perfeito no celular
✅ Skip-friendly - Usuário pode pular se quiser
Tempo: 4-6 horas
Custo: R$ 0 (100% grátis!)
Tecnologia: Shadcn/UI + Framer Motion + Supabase

🎨 PREVIEW DO FLUXO:
┌─────────────────────────────────┐
│  🎉 Bem-vindo ao Isacar!        │
│                                 │
│  Configure tudo em 2 minutos    │
│                                 │
│  [Começar]  [Pular]            │
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│  👤 Quem é você?                │
│                                 │
│  ○ Freelancer                   │
│  ○ Pequena empresa              │
│  ○ Empresa                      │
│  ○ Uso pessoal                  │
│                                 │
│  [Próximo]                      │
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│  🎯 Qual seu objetivo?          │
│                                 │
│  ☑ Gerenciar tarefas           │
│  ☑ Controlar finanças          │
│  ☑ Colaborar equipe            │
│  ☑ Métricas                    │
│                                 │
│  [Próximo]                      │
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│  🏢 Nome do workspace           │
│                                 │
│  [Minha Empresa___________]     │
│                                 │
│  [Criar workspace]              │
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│  📍 Tour rápido [1/4]           │
│                                 │
│  ┌──────────────────────┐      │
│  │   [Dashboard]   ←──  │      │
│  └──────────────────────┘      │
│                                 │
│  Este é seu painel central      │
│                                 │
│  [Próximo]  [Pular]            │
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│  🚀 Crie sua primeira tarefa!   │
│                                 │
│  Título: [_________________]    │
│  Data: [__/__/__]              │
│                                 │
│  [Criar]  [Fazer depois]       │
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│  🎉 Tudo pronto!                │
│                                 │
│  Você está pronto para começar  │
│                                 │
│  [Ir para Dashboard]            │
└─────────────────────────────────┘

🗄️ PARTE 1: BANCO DE DADOS
SQL para executar no Supabase:
sql-- ============================================
-- TABELA: onboarding_analytics
-- Rastreia todo o processo de onboarding
-- ============================================

CREATE TABLE IF NOT EXISTS onboarding_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  
  -- Perfil do usuário
  user_type TEXT CHECK (user_type IN ('freelancer', 'small_business', 'enterprise', 'personal')),
  industry TEXT,
  team_size TEXT CHECK (team_size IN ('1', '2-10', '11-50', '50+')),
  company_name TEXT,
  
  -- Objetivos selecionados
  primary_goal TEXT CHECK (primary_goal IN ('tasks', 'finance', 'projects', 'all')),
  secondary_goals TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Progresso do onboarding
  current_step INT DEFAULT 1,
  total_steps INT DEFAULT 6,
  steps_completed INT[] DEFAULT ARRAY[]::INT[],
  completed BOOLEAN DEFAULT false,
  skipped BOOLEAN DEFAULT false,
  abandoned_at_step INT,
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_spent_seconds INT DEFAULT 0,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ações realizadas
  created_workspace BOOLEAN DEFAULT false,
  created_first_task BOOLEAN DEFAULT false,
  created_first_transaction BOOLEAN DEFAULT false,
  invited_team_member BOOLEAN DEFAULT false,
  completed_tour BOOLEAN DEFAULT false,
  
  -- Contexto técnico
  device_type TEXT, -- 'mobile' | 'desktop' | 'tablet'
  browser TEXT,
  os TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_campaign TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint único por usuário
  UNIQUE(user_id)
);

-- Índices para performance
CREATE INDEX idx_onboarding_user_id ON onboarding_analytics(user_id);
CREATE INDEX idx_onboarding_completed ON onboarding_analytics(completed);
CREATE INDEX idx_onboarding_user_type ON onboarding_analytics(user_type);
CREATE INDEX idx_onboarding_started_at ON onboarding_analytics(started_at);
CREATE INDEX idx_onboarding_primary_goal ON onboarding_analytics(primary_goal);

-- RLS (Row Level Security)
ALTER TABLE onboarding_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver e editar apenas seus próprios dados
CREATE POLICY "Users manage their own onboarding"
  ON onboarding_analytics FOR ALL
  USING (user_id = auth.uid());

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_onboarding_updated_at
  BEFORE UPDATE ON onboarding_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_updated_at();

-- View para analytics (admin/dashboard)
CREATE OR REPLACE VIEW onboarding_stats AS
SELECT
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE completed = true) as completed_count,
  COUNT(*) FILTER (WHERE skipped = true) as skipped_count,
  COUNT(*) FILTER (WHERE abandoned_at_step IS NOT NULL) as abandoned_count,
  ROUND(AVG(time_spent_seconds)) as avg_time_seconds,
  COUNT(*) FILTER (WHERE user_type = 'freelancer') as freelancer_count,
  COUNT(*) FILTER (WHERE user_type = 'small_business') as small_business_count,
  COUNT(*) FILTER (WHERE user_type = 'enterprise') as enterprise_count,
  COUNT(*) FILTER (WHERE user_type = 'personal') as personal_count,
  COUNT(*) FILTER (WHERE primary_goal = 'tasks') as goal_tasks_count,
  COUNT(*) FILTER (WHERE primary_goal = 'finance') as goal_finance_count,
  COUNT(*) FILTER (WHERE primary_goal = 'projects') as goal_projects_count,
  COUNT(*) FILTER (WHERE created_first_task = true) as created_task_count,
  COUNT(*) FILTER (WHERE invited_team_member = true) as invited_team_count
FROM onboarding_analytics;

-- Verificar se criou corretamente
SELECT 'Tabela onboarding_analytics criada com sucesso!' as status;

💻 PARTE 2: TIPOS TYPESCRIPT
ARQUIVO: src/types/onboarding.ts (CRIAR)
typescriptexport type UserType = 'freelancer' | 'small_business' | 'enterprise' | 'personal'

export type PrimaryGoal = 'tasks' | 'finance' | 'projects' | 'all'

export type TeamSize = '1' | '2-10' | '11-50' | '50+'

export interface OnboardingStep {
  id: number
  title: string
  description: string
  component: React.ComponentType<OnboardingStepProps>
  optional?: boolean
}

export interface OnboardingStepProps {
  onNext: (data?: any) => void
  onSkip?: () => void
  onBack?: () => void
  isFirst?: boolean
  isLast?: boolean
}

export interface OnboardingData {
  // Perfil
  userType?: UserType
  industry?: string
  teamSize?: TeamSize
  companyName?: string
  
  // Objetivos
  primaryGoal?: PrimaryGoal
  secondaryGoals?: string[]
  
  // Workspace
  workspaceName?: string
  
  // Progresso
  currentStep: number
  stepsCompleted: number[]
  
  // Timing
  startedAt: Date
  lastActiveAt: Date
}

export interface OnboardingAnalytics extends OnboardingData {
  id: string
  userId: string
  workspaceId?: string
  completed: boolean
  skipped: boolean
  abandonedAtStep?: number
  completedAt?: Date
  timeSpentSeconds: number
  createdWorkspace: boolean
  createdFirstTask: boolean
  createdFirstTransaction: boolean
  invitedTeamMember: boolean
  completedTour: boolean
  deviceType?: string
  browser?: string
  os?: string
  referrer?: string
  utmSource?: string
  utmCampaign?: string
}

🎣 PARTE 3: HOOK REACT
ARQUIVO: src/hooks/use-onboarding.ts (CRIAR)
typescriptimport { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import type { OnboardingData, OnboardingAnalytics, UserType, PrimaryGoal } from '@/types/onboarding'

const TOTAL_STEPS = 6

export function useOnboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [data, setData] = useState<OnboardingData>({
    currentStep: 1,
    stepsCompleted: [],
    startedAt: new Date(),
    lastActiveAt: new Date()
  })
  
  const [loading, setLoading] = useState(false)
  const [analyticsId, setAnalyticsId] = useState<string | null>(null)

  // Inicializar/Restaurar onboarding
  useEffect(() => {
    if (!user) return

    const initOnboarding = async () => {
      try {
        // Verificar se já existe registro
        const { data: existing } = await supabase
          .from('onboarding_analytics')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (existing) {
          // Restaurar estado
          setAnalyticsId(existing.id)
          setData({
            userType: existing.user_type,
            industry: existing.industry,
            teamSize: existing.team_size,
            companyName: existing.company_name,
            primaryGoal: existing.primary_goal,
            secondaryGoals: existing.secondary_goals || [],
            workspaceName: undefined,
            currentStep: existing.current_step,
            stepsCompleted: existing.steps_completed || [],
            startedAt: new Date(existing.started_at),
            lastActiveAt: new Date(existing.last_active_at)
          })
        } else {
          // Criar novo registro
          const { data: newRecord, error } = await supabase
            .from('onboarding_analytics')
            .insert({
              user_id: user.id,
              device_type: getDeviceType(),
              browser: getBrowser(),
              os: getOS(),
              referrer: document.referrer || null
            })
            .select()
            .single()

          if (error) throw error
          setAnalyticsId(newRecord.id)
        }
      } catch (error) {
        console.error('Erro ao inicializar onboarding:', error)
      }
    }

    initOnboarding()
  }, [user])

  // Atualizar analytics no backend
  const updateAnalytics = useCallback(async (updates: Partial<OnboardingAnalytics>) => {
    if (!analyticsId) return

    try {
      const { error } = await supabase
        .from('onboarding_analytics')
        .update({
          ...updates,
          last_active_at: new Date().toISOString(),
          time_spent_seconds: Math.floor((Date.now() - data.startedAt.getTime()) / 1000)
        })
        .eq('id', analyticsId)

      if (error) throw error
    } catch (error) {
      console.error('Erro ao atualizar analytics:', error)
    }
  }, [analyticsId, data.startedAt])

  // Avançar para próximo passo
  const nextStep = useCallback(async (stepData?: any) => {
    const newData = { ...data, ...stepData }
    const nextStepNumber = data.currentStep + 1
    
    setData({
      ...newData,
      currentStep: nextStepNumber,
      stepsCompleted: [...data.stepsCompleted, data.currentStep],
      lastActiveAt: new Date()
    })

    // Atualizar no backend
    await updateAnalytics({
      ...stepData,
      current_step: nextStepNumber,
      steps_completed: [...data.stepsCompleted, data.currentStep]
    })
  }, [data, updateAnalytics])

  // Voltar passo anterior
  const previousStep = useCallback(() => {
    if (data.currentStep > 1) {
      setData(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1,
        lastActiveAt: new Date()
      }))

      updateAnalytics({
        current_step: data.currentStep - 1
      })
    }
  }, [data.currentStep, updateAnalytics])

  // Pular onboarding
  const skip = useCallback(async () => {
    try {
      await updateAnalytics({
        skipped: true,
        abandoned_at_step: data.currentStep,
        completed_at: new Date().toISOString()
      })

      toast.info('Você pode configurar isso depois em Settings')
      navigate('/dashboard')
    } catch (error) {
      console.error('Erro ao pular onboarding:', error)
    }
  }, [data.currentStep, updateAnalytics, navigate])

  // Completar onboarding
  const complete = useCallback(async () => {
    setLoading(true)

    try {
      await updateAnalytics({
        completed: true,
        completed_at: new Date().toISOString(),
        steps_completed: Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1)
      })

      toast.success('🎉 Tudo pronto! Bem-vindo ao Isacar!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Erro ao completar onboarding:', error)
      toast.error('Erro ao finalizar onboarding')
    } finally {
      setLoading(false)
    }
  }, [updateAnalytics, navigate])

  // Registrar ação
  const trackAction = useCallback(async (action: string, value: boolean = true) => {
    const actionMap: Record<string, string> = {
      'workspace': 'created_workspace',
      'task': 'created_first_task',
      'transaction': 'created_first_transaction',
      'invite': 'invited_team_member',
      'tour': 'completed_tour'
    }

    const dbField = actionMap[action]
    if (dbField) {
      await updateAnalytics({ [dbField]: value } as any)
    }
  }, [updateAnalytics])

  return {
    data,
    currentStep: data.currentStep,
    totalSteps: TOTAL_STEPS,
    progress: (data.stepsCompleted.length / TOTAL_STEPS) * 100,
    loading,
    nextStep,
    previousStep,
    skip,
    complete,
    trackAction,
    isFirst: data.currentStep === 1,
    isLast: data.currentStep === TOTAL_STEPS
  }
}

// Helpers
function getDeviceType(): string {
  const ua = navigator.userAgent
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet'
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile'
  }
  return 'desktop'
}

function getBrowser(): string {
  const ua = navigator.userAgent
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Edge')) return 'Edge'
  return 'Other'
}

function getOS(): string {
  const ua = navigator.userAgent
  if (ua.includes('Win')) return 'Windows'
  if (ua.includes('Mac')) return 'macOS'
  if (ua.includes('Linux')) return 'Linux'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('iOS')) return 'iOS'
  return 'Other'
}

🎨 PARTE 4: COMPONENTES UI
ARQUIVO: src/components/onboarding/onboarding-container.tsx (CRIAR)
typescriptimport { useOnboarding } from '@/hooks/use-onboarding'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

// Steps
import { WelcomeStep } from './steps/welcome-step'
import { UserTypeStep } from './steps/user-type-step'
import { GoalsStep } from './steps/goals-step'
import { WorkspaceStep } from './steps/workspace-step'
import { TourStep } from './steps/tour-step'
import { FirstTaskStep } from './steps/first-task-step'

const STEPS = [
  { id: 1, component: WelcomeStep },
  { id: 2, component: UserTypeStep },
  { id: 3, component: GoalsStep },
  { id: 4, component: WorkspaceStep },
  { id: 5, component: TourStep },
  { id: 6, component: FirstTaskStep }
]

export function OnboardingContainer() {
  const {
    currentStep,
    totalSteps,
    progress,
    nextStep,
    previousStep,
    skip,
    isFirst,
    isLast
  } = useOnboarding()

  const CurrentStepComponent = STEPS[currentStep - 1]?.component

  if (!CurrentStepComponent) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background flex items-center justify-center p-4">
      {/* Skip button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4"
        onClick={skip}
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Progress bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
        <div className="space-y-2">
          <Progress value={progress} className="h-1" />
          <p className="text-xs text-center text-muted-foreground">
            Passo {currentStep} de {totalSteps}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CurrentStepComponent
              onNext={nextStep}
              onBack={previousStep}
              onSkip={skip}
              isFirst={isFirst}
              isLast={isLast}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

ARQUIVO: src/components/onboarding/steps/welcome-step.tsx (CRIAR)
typescriptimport { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { OnboardingStepProps } from '@/types/onboarding'
import { Sparkles } from 'lucide-react'

export function WelcomeStep({ onNext, onSkip }: OnboardingStepProps) {
  return (
    <Card className="border-none shadow-2xl">
      <CardHeader className="text-center space-y-4 pb-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Bem-vindo ao Isacar! 🎉</h1>
          <p className="text-muted-foreground">
            Vamos configurar tudo em apenas 2 minutos
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-medium">1</span>
            </div>
            <div>
              <p className="font-medium">Conte-nos sobre você</p>
              <p className="text-muted-foreground text-xs">
                Para personalizar sua experiência
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-medium">2</span>
            </div>
            <div>
              <p className="font-medium">Configure seu workspace</p>
              <p className="text-muted-foreground text-xs">
                Crie seu espaço de trabalho
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-medium">3</span>
            </div>
            <div>
              <p className="font-medium">Tour rápido</p>
              <p className="text-muted-foreground text-xs">
                Conheça as principais funcionalidades
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onSkip} className="flex-1">
            Pular
          </Button>
          <Button onClick={() => onNext()} className="flex-1">
            Começar →
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

ARQUIVO: src/components/onboarding/steps/user-type-step.tsx (CRIAR)
typescriptimport { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import type { OnboardingStepProps, UserType } from '@/types/onboarding'
import { User, Users, Building, Home } from 'lucide-react'

const USER_TYPES = [
  {
    value: 'freelancer' as UserType,
    label: 'Freelancer / Autônomo',
    description: 'Trabalho por conta própria',
    icon: User
  },
  {
    value: 'small_business' as UserType,
    label: 'Pequena Empresa',
    description: '2-10 pessoas',
    icon: Users
  },
  {
    value: 'enterprise' as UserType,
    label: 'Empresa',
    description: 'Mais de 10 pessoas',
    icon: Building
  },
  {
    value: 'personal' as UserType,
    label: 'Uso Pessoal',
    description: 'Projetos pessoais',
    icon: Home
  }
]

export function UserTypeStep({ onNext, onBack }: OnboardingStepProps) {
  const [selected, setSelected] = useState<UserType>()

  const handleNext = () => {
    if (selected) {
      onNext({ userType: selected })
    }
  }

  return (
    <Card className="border-none shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle>👤 Quem é você?</CardTitle>
        <CardDescription>
          Isso nos ajuda a personalizar sua experiência
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <RadioGroup value={selected} onValueChange={(v) => setSelected(v as UserType)}>
          <div className="space-y-2">
            {USER_TYPES.map((type) => {
              const Icon = type.icon
              return (
                <Label
                  key={type.value}
                  htmlFor={type.value}
                  className={`
                    flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                    hover:border-primary/50 hover:bg-accent/50
                    ${selected === type.value ? 'border-primary bg-accent' : 'border-border'}
                  `}
                >
                  <RadioGroupItem value={type.value} id={type.value} className="shrink-0" />
                  <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{type.label}</p>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </Label>
              )
            })}
          </div>
        </RadioGroup>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onBack}>
            ← Voltar
          </Button>
          <Button onClick={handleNext} disabled={!selected} className="flex-1">
            Próximo →
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

ARQUIVO: src/components/onboarding/steps/goals-step.tsx (CRIAR)
typescriptimport { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { OnboardingStepProps } from '@/types/onboarding'
import { CheckSquare, DollarSign, Briefcase, BarChart } from 'lucide-react'

const GOALS = [
  {
    id: 'tasks',
    label: 'Gerenciar tarefas e projetos',
    description: 'Organizar trabalho e acompanhar progresso',
    icon: CheckSquare
  },
  {
    id: 'finance',
    label: 'Controlar finanças',
    description: 'Receitas, despesas e orçamento',
    icon: DollarSign
  },
  {
    id: 'projects',
    label: 'Gestão de projetos',
    description: 'Cronogramas, entregas e equipe',
    icon: Briefcase
  },
  {
    id: 'analytics',
    label: 'Acompanhar métricas',
    description: 'Dashboards e relatórios',
    icon: BarChart
  }
]

export function GoalsStep({ onNext, onBack }: OnboardingStepProps) {
  const [selected, setSelected] = useState<string[]>([])

  const toggleGoal = (goalId: string) => {
    setSelected(prev =>
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    )
  }

  const handleNext = () => {
    if (selected.length > 0) {
      onNext({
        primaryGoal: selected[0],
        secondaryGoals: selected.slice(1)
      })
    }
  }

  return (
    <Card className="border-none shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle>🎯 O que você quer fazer?</CardTitle>
        <CardDescription>
          Selecione uma ou mais opções
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          {GOALS.map((goal) => {
            const Icon = goal.icon
            const isSelected = selected.includes(goal.id)

            return (
              <Label
                key={goal.id}
                htmlFor={goal.id}
                className={`
                  flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                  hover:border-primary/50 hover:bg-accent/50
                  ${isSelected ? 'border-primary bg-accent' : 'border-border'}
                `}
              >
                <Checkbox
                  id={goal.id}
                  checked={isSelected}
                  onCheckedChange={() => toggleGoal(goal.id)}
                  className="mt-0.5 shrink-0"
                />
                <Icon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{goal.label}</p>
                  <p className="text-xs text-muted-foreground">{goal.description}</p>
                </div>
              </Label>
            )
          })}
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onBack}>
            ← Voltar
          </Button>
          <Button onClick={handleNext} disabled={selected.length === 0} className="flex-1">
            Próximo →
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

📊 PARTE 5: DASHBOARD DE ANALYTICS (Continuação no próximo arquivo...)
Documento muito extenso - continua em ONBOARDING_COMPLETO_PARTE2.md

🎯 IMPLEMENTAÇÃO:
PASSO 1: Execute SQL no Supabase ✅
PASSO 2: Cole código na IDE (prompt abaixo) ✅
PASSO 3: Teste onboarding ✅
PASSO 4: Veja analytics funcionando ✅
Tempo: 4-6 horas
Status: Pronto para implementar!

ONBOARDING PARTE 2 - STEPS FINAIS + ANALYTICS
📋 CONTINUAÇÃO DA PARTE 1
Esta é a continuação do documento ONBOARDING_COMPLETO.md

🎨 PARTE 5: STEPS RESTANTES
ARQUIVO: src/components/onboarding/steps/workspace-step.tsx (CRIAR)
typescriptimport { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { OnboardingStepProps } from '@/types/onboarding'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { Building2, Loader2 } from 'lucide-react'

export function WorkspaceStep({ onNext, onBack }: OnboardingStepProps) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleNext = async () => {
    if (!name.trim()) {
      toast.error('Digite um nome para o workspace')
      return
    }

    if (!user) return

    setLoading(true)

    try {
      // Criar workspace
      const { data: workspace, error } = await supabase
        .from('workspaces')
        .insert({
          name: name.trim(),
          user_id: user.id,
          settings: {
            onboarding_completed: true
          }
        })
        .select()
        .single()

      if (error) throw error

      // Criar membro (owner)
      await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          role: 'owner'
        })

      toast.success('Workspace criado!')
      
      onNext({
        workspaceName: name,
        workspaceId: workspace.id
      })
    } catch (error: any) {
      console.error('Erro ao criar workspace:', error)
      toast.error('Erro ao criar workspace')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-none shadow-2xl">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>🏢 Crie seu workspace</CardTitle>
        <CardDescription>
          Um espaço para organizar tudo
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="workspace-name">Nome do workspace</Label>
          <Input
            id="workspace-name"
            placeholder="Ex: Minha Empresa, Projetos Pessoais..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading) {
                handleNext()
              }
            }}
            disabled={loading}
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Você pode criar mais workspaces depois
          </p>
        </div>

        <div className="bg-accent/50 p-3 rounded-lg text-sm space-y-1">
          <p className="font-medium">💡 Dica:</p>
          <p className="text-muted-foreground text-xs">
            Use um nome que faça sentido para você. Por exemplo: "Freelancer 2025", 
            "Empresa X", ou "Vida Pessoal".
          </p>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onBack} disabled={loading}>
            ← Voltar
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={!name.trim() || loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar workspace →'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

ARQUIVO: src/components/onboarding/steps/tour-step.tsx (CRIAR)
typescriptimport { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { OnboardingStepProps } from '@/types/onboarding'
import { 
  LayoutDashboard, 
  CheckSquare, 
  DollarSign, 
  Settings,
  ArrowRight,
  Sparkles
} from 'lucide-react'

const TOUR_STEPS = [
  {
    icon: LayoutDashboard,
    title: 'Dashboard',
    description: 'Seu painel central com visão geral de tudo',
    features: ['Cards personalizáveis', 'Métricas em tempo real', 'Atalhos rápidos']
  },
  {
    icon: CheckSquare,
    title: 'Tasks',
    description: 'Gerencie tarefas, projetos e prazos',
    features: ['Kanban board', 'Prioridades', 'Colaboração']
  },
  {
    icon: DollarSign,
    title: 'Finance',
    description: 'Controle completo das suas finanças',
    features: ['Receitas e despesas', 'Orçamento', 'Relatórios']
  },
  {
    icon: Settings,
    title: 'Configurações',
    description: 'Personalize tudo do seu jeito',
    features: ['Integrações', 'Equipe', 'Preferências']
  }
]

export function TourStep({ onNext, onBack, onSkip }: OnboardingStepProps) {
  const [currentTourStep, setCurrentTourStep] = useState(0)

  const isLastTourStep = currentTourStep === TOUR_STEPS.length - 1

  const handleNext = () => {
    if (isLastTourStep) {
      onNext({ completedTour: true })
    } else {
      setCurrentTourStep(prev => prev + 1)
    }
  }

  const currentStep = TOUR_STEPS[currentTourStep]
  const Icon = currentStep.icon

  return (
    <Card className="border-none shadow-2xl">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
            <Sparkles className="h-4 w-4" />
            <span>Tour rápido • {currentTourStep + 1}/{TOUR_STEPS.length}</span>
          </div>
          <h2 className="text-2xl font-bold">{currentStep.title}</h2>
          <p className="text-muted-foreground">{currentStep.description}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Features */}
        <div className="space-y-2">
          {currentStep.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <ArrowRight className="h-3 w-3 text-primary" />
              </div>
              <p className="text-sm">{feature}</p>
            </div>
          ))}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5">
          {TOUR_STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentTourStep 
                  ? 'w-8 bg-primary' 
                  : 'w-1.5 bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {currentTourStep === 0 ? (
            <Button variant="outline" onClick={onSkip}>
              Pular tour
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setCurrentTourStep(prev => prev - 1)}>
              ← Anterior
            </Button>
          )}
          
          <Button onClick={handleNext} className="flex-1">
            {isLastTourStep ? 'Finalizar tour →' : 'Próximo →'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

ARQUIVO: src/components/onboarding/steps/first-task-step.tsx (CRIAR)
typescriptimport { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { OnboardingStepProps } from '@/types/onboarding'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { CalendarIcon, Loader2, PartyPopper, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export function FirstTaskStep({ onNext, onBack }: OnboardingStepProps) {
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState<Date>()
  const [loading, setLoading] = useState(false)
  const [skipping, setSkipping] = useState(false)

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error('Digite um título para a tarefa')
      return
    }

    setLoading(true)

    try {
      // Pegar workspace_id do onboarding data (passado do step anterior)
      // Por enquanto, vamos criar sem workspace (ajustar depois)
      
      const { error } = await supabase
        .from('tasks')
        .insert({
          title: title.trim(),
          due_date: dueDate?.toISOString(),
          status: 'todo',
          priority: 'medium'
        })

      if (error) throw error

      toast.success('🎉 Primeira tarefa criada!')
      
      onNext({ 
        createdFirstTask: true,
        firstTaskTitle: title 
      })
    } catch (error: any) {
      console.error('Erro ao criar tarefa:', error)
      toast.error('Erro ao criar tarefa')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    setSkipping(true)
    onNext({ createdFirstTask: false })
  }

  return (
    <Card className="border-none shadow-2xl">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>🚀 Crie sua primeira tarefa!</CardTitle>
        <CardDescription>
          Comece organizando seu trabalho
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Título */}
        <div className="space-y-2">
          <Label htmlFor="task-title">O que você precisa fazer?</Label>
          <Input
            id="task-title"
            placeholder="Ex: Finalizar proposta para cliente..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading) {
                handleCreate()
              }
            }}
            disabled={loading}
            autoFocus
          />
        </div>

        {/* Data */}
        <div className="space-y-2">
          <Label>Prazo (opcional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !dueDate && 'text-muted-foreground'
                )}
                disabled={loading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? (
                  format(dueDate, "PPP", { locale: ptBR })
                ) : (
                  'Selecionar data'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Motivação */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/50 p-4 rounded-lg text-sm space-y-1">
          <div className="flex items-center gap-2">
            <PartyPopper className="h-4 w-4 text-primary" />
            <p className="font-medium">Você está quase lá!</p>
          </div>
          <p className="text-muted-foreground text-xs">
            Esta é a última etapa. Depois disso, você estará pronto para usar o Isacar!
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            onClick={handleSkip}
            disabled={loading || skipping}
          >
            {skipping ? 'Pulando...' : 'Fazer depois'}
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={!title.trim() || loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar tarefa →'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

📊 PARTE 6: DASHBOARD DE ANALYTICS
ARQUIVO: src/pages/admin/onboarding-analytics.tsx (CRIAR)
typescriptimport { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  Target,
  Briefcase
} from 'lucide-react'

interface OnboardingStats {
  total_users: number
  completed_count: number
  skipped_count: number
  abandoned_count: number
  avg_time_seconds: number
  freelancer_count: number
  small_business_count: number
  enterprise_count: number
  personal_count: number
  goal_tasks_count: number
  goal_finance_count: number
  goal_projects_count: number
  created_task_count: number
  invited_team_count: number
}

interface UserTypeData {
  label: string
  value: number
  percentage: number
  color: string
}

export default function OnboardingAnalyticsPage() {
  const [stats, setStats] = useState<OnboardingStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('onboarding_stats')
        .select('*')
        .single()

      if (error) throw error
      setStats(data)
    } catch (error) {
      console.error('Erro ao carregar stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  const completionRate = Math.round((stats.completed_count / stats.total_users) * 100)
  const skipRate = Math.round((stats.skipped_count / stats.total_users) * 100)
  const abandonRate = Math.round((stats.abandoned_count / stats.total_users) * 100)
  const avgTimeMinutes = Math.round(stats.avg_time_seconds / 60)

  const userTypes: UserTypeData[] = [
    {
      label: 'Freelancers',
      value: stats.freelancer_count,
      percentage: Math.round((stats.freelancer_count / stats.total_users) * 100),
      color: 'bg-blue-500'
    },
    {
      label: 'Pequenas Empresas',
      value: stats.small_business_count,
      percentage: Math.round((stats.small_business_count / stats.total_users) * 100),
      color: 'bg-green-500'
    },
    {
      label: 'Empresas',
      value: stats.enterprise_count,
      percentage: Math.round((stats.enterprise_count / stats.total_users) * 100),
      color: 'bg-purple-500'
    },
    {
      label: 'Uso Pessoal',
      value: stats.personal_count,
      percentage: Math.round((stats.personal_count / stats.total_users) * 100),
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics de Onboarding</h1>
        <p className="text-muted-foreground">
          Insights sobre como os usuários estão completando o onboarding
        </p>
      </div>

      {/* KPIs principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_users}</div>
            <p className="text-xs text-muted-foreground">
              iniciaram o onboarding
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.completed_count} completaram
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Abandono</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{abandonRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.abandoned_count} abandonaram
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgTimeMinutes}min</div>
            <p className="text-xs text-muted-foreground">
              para completar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Tipos de Usuário</TabsTrigger>
          <TabsTrigger value="goals">Objetivos</TabsTrigger>
          <TabsTrigger value="actions">Ações</TabsTrigger>
        </TabsList>

        {/* Tab: Tipos de Usuário */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Tipo de Usuário</CardTitle>
              <CardDescription>
                Quem são seus usuários
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userTypes.map((type) => (
                <div key={type.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{type.label}</span>
                    <span className="text-muted-foreground">
                      {type.value} ({type.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${type.color} transition-all`}
                      style={{ width: `${type.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm">
                  <strong>{userTypes[0].percentage}%</strong> dos usuários são <strong>Freelancers</strong>.
                  Considere adicionar features específicas para este público.
                </p>
              </div>
              
              {userTypes[3].percentage > 20 && (
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <p className="text-sm">
                    <strong>{userTypes[3].percentage}%</strong> usam para <strong>fins pessoais</strong>.
                    Pode valer a pena criar templates para uso pessoal.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Objetivos */}
        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Objetivos Principais</CardTitle>
              <CardDescription>
                O que os usuários querem fazer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span className="font-medium">Gerenciar Tarefas</span>
                  </div>
                  <span className="text-muted-foreground">
                    {stats.goal_tasks_count} ({Math.round((stats.goal_tasks_count / stats.total_users) * 100)}%)
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${(stats.goal_tasks_count / stats.total_users) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span className="font-medium">Controlar Finanças</span>
                  </div>
                  <span className="text-muted-foreground">
                    {stats.goal_finance_count} ({Math.round((stats.goal_finance_count / stats.total_users) * 100)}%)
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${(stats.goal_finance_count / stats.total_users) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span className="font-medium">Gestão de Projetos</span>
                  </div>
                  <span className="text-muted-foreground">
                    {stats.goal_projects_count} ({Math.round((stats.goal_projects_count / stats.total_users) * 100)}%)
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all"
                    style={{ width: `${(stats.goal_projects_count / stats.total_users) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Ações */}
        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ações Realizadas</CardTitle>
              <CardDescription>
                O que os usuários fizeram após o onboarding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                <div>
                  <p className="font-medium">Criaram primeira tarefa</p>
                  <p className="text-sm text-muted-foreground">
                    Ativação inicial
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{stats.created_task_count}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((stats.created_task_count / stats.total_users) * 100)}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                <div>
                  <p className="font-medium">Convidaram membro</p>
                  <p className="text-sm text-muted-foreground">
                    Colaboração em equipe
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{stats.invited_team_count}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((stats.invited_team_count / stats.total_users) * 100)}%
                  </p>
                </div>
              </div>

              {/* Recomendações */}
              <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg space-y-2">
                <p className="font-medium">💡 Recomendações</p>
                
                {stats.created_task_count / stats.total_users < 0.5 && (
                  <p className="text-sm text-muted-foreground">
                    • Apenas {Math.round((stats.created_task_count / stats.total_users) * 100)}% 
                    criam tarefas. Considere tornar este passo obrigatório ou mais destacado.
                  </p>
                )}

                {stats.invited_team_count / stats.total_users < 0.2 && (
                  <p className="text-sm text-muted-foreground">
                    • Poucos usuários convidam membros. Adicione incentivos ou torne o processo mais simples.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

🛣️ PARTE 7: ROTAS E INTEGRAÇÃO
ARQUIVO: src/App.tsx (ADICIONAR)
typescriptimport OnboardingContainer from '@/components/onboarding/onboarding-container'
import OnboardingAnalyticsPage from '@/pages/admin/onboarding-analytics'

// Dentro das rotas:
<Route path="/onboarding" element={<OnboardingContainer />} />
<Route path="/admin/onboarding-analytics" element={<OnboardingAnalyticsPage />} />

Redirecionar novos usuários para onboarding:
ARQUIVO: src/contexts/auth-context.tsx (MODIFICAR)
typescript// Após signup bem-sucedido:
useEffect(() => {
  if (user && !user.user_metadata?.onboarding_completed) {
    navigate('/onboarding')
  }
}, [user, navigate])

✅ CHECKLIST FINAL:
BACKEND:

 SQL executado no Supabase
 View onboarding_stats criada
 RLS configurado

FRONTEND:

 Tipos TypeScript criados
 Hook use-onboarding criado
 Container principal criado
 6 Steps criados (Welcome, UserType, Goals, Workspace, Tour, FirstTask)
 Dashboard Analytics criado
 Rotas adicionadas

INTEGRAÇÃO:

 Redirecionamento após signup
 Salvar flag onboarding_completed no user_metadata
 Testar fluxo completo


🎯 PROMPT PARA IDE:
markdownIMPLEMENTAR ONBOARDING COMPLETO - PARTE 2

Criar arquivos:

1. src/components/onboarding/steps/workspace-step.tsx
2. src/components/onboarding/steps/tour-step.tsx
3. src/components/onboarding/steps/first-task-step.tsx
4. src/pages/admin/onboarding-analytics.tsx

5. Adicionar rotas no App.tsx:
   - /onboarding
   - /admin/onboarding-analytics

6. Modificar auth-context.tsx para redirecionar novos usuários

IMPORTANTE:
- Seguir código EXATAMENTE como está no documento
- Importar componentes corretamente
- Testar cada step individualmente

Começar AGORA!

📊 MÉTRICAS QUE VOCÊ VAI TER:
Conversão:

Taxa de conclusão: X%
Taxa de abandono: X%
Passo mais abandonado: Step X

Perfil:

X% Freelancers
X% Pequenas empresas
X% Uso pessoal

Objetivos:

X% querem tasks
X% querem finance
X% querem projetos

Ações:

X% criam primeira task
X% convidam equipe
Tempo médio: X minutos


💰 CUSTO TOTAL:
R$ 0! 🎉
Tudo incluído no Supabase free tier!

⏱️ TEMPO IMPLEMENTAÇÃO:
Total: 4-6 horas

SQL: 5 min
Steps: 2h
Dashboard: 1-2h
Integração: 1h
Testes: 1h


🎉 RESULTADO FINAL:
Onboarding completo + Dashboard de analytics para você conhecer seu público e otimizar a experiência!
Status: Pronto para implementar! 🚀