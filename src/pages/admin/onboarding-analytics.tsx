import { useEffect, useState } from 'react'
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

  const completionRate = Math.round((stats.completed_count / stats.total_users) * 100) || 0
  const skipRate = Math.round((stats.skipped_count / stats.total_users) * 100) || 0
  const abandonRate = Math.round((stats.abandoned_count / stats.total_users) * 100) || 0
  const avgTimeMinutes = Math.round(stats.avg_time_seconds / 60) || 0

  const userTypes: UserTypeData[] = [
    {
      label: 'Freelancers',
      value: stats.freelancer_count,
      percentage: Math.round((stats.freelancer_count / stats.total_users) * 100) || 0,
      color: 'bg-blue-500'
    },
    {
      label: 'Pequenas Empresas',
      value: stats.small_business_count,
      percentage: Math.round((stats.small_business_count / stats.total_users) * 100) || 0,
      color: 'bg-green-500'
    },
    {
      label: 'Empresas',
      value: stats.enterprise_count,
      percentage: Math.round((stats.enterprise_count / stats.total_users) * 100) || 0,
      color: 'bg-purple-500'
    },
    {
      label: 'Uso Pessoal',
      value: stats.personal_count,
      percentage: Math.round((stats.personal_count / stats.total_users) * 100) || 0,
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

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Tipos de Usuário</TabsTrigger>
          <TabsTrigger value="goals">Objetivos</TabsTrigger>
          <TabsTrigger value="actions">Ações</TabsTrigger>
        </TabsList>

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
