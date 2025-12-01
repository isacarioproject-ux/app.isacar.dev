import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Save, Loader2, CheckSquare, Wallet, ArrowRight, FolderKanban, Plug, Mail, Calendar, FileSpreadsheet, Settings2, HelpCircle, Link2 } from 'lucide-react'
import { toast } from 'sonner'
import { GoogleIntegrationCard } from '@/components/integrations/google-integration-card'
import { GmailInvoiceScanner } from '@/components/integrations/gmail-invoice-scanner'
import { CalendarSyncPanel } from '@/components/integrations/calendar-sync-panel'
import { SheetsExportDialog } from '@/components/integrations/sheets-export-dialog'
import { supabase } from '@/lib/supabase'
import { useWorkspace } from '@/contexts/workspace-context'
import { useGoogleIntegration } from '@/hooks/use-google-integration'
import { useI18n } from '@/hooks/use-i18n'

export default function IntegrationsPage() {
  const { t } = useI18n()
  const { currentWorkspace } = useWorkspace()
  const { isConnected: isGoogleConnected } = useGoogleIntegration()
  const [config, setConfig] = useState({
    ENABLED: false,
    WHITEBOARD_TO_TASKS: true,
    WHITEBOARD_TO_GERENCIADOR: true,
    TASKS_TO_FINANCE: true,
    PROJECTS_TO_FINANCE: true,
    AUTO_CREATE: true,
    SHOW_NOTIFICATIONS: true,
    DEBUG_MODE: false,
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [activeGoogleTab, setActiveGoogleTab] = useState('connection')
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  // ✨ Detectar retorno do Google OAuth
  useEffect(() => {
    const handleGoogleCallback = async () => {
      // Verificar se já processamos este callback (evitar loop infinito)
      const callbackProcessed = sessionStorage.getItem('google_oauth_processed')
      if (callbackProcessed) {
        console.log('⏭️ Callback já processado, pulando...')
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      
      console.log('🔍 Verificando sessão na página:', {
        hasSession: !!session,
        hasProviderToken: !!session?.provider_token
      })

      if (session?.provider_token && session?.user) {
        // Marcar como processado ANTES de fazer qualquer coisa
        sessionStorage.setItem('google_oauth_processed', 'true')
        console.log('✅ Provider token encontrado, salvando...')
        
        try {
          // Buscar email do Google
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${session.provider_token}` }
          })

          if (!userInfoResponse.ok) {
            throw new Error('Erro ao buscar info do Google')
          }
          
          const userInfo = await userInfoResponse.json()
          console.log('📧 Email do Google:', userInfo.email)

          // Calcular token_expires_at (Google tokens expiram em 1h)
          const expiresAt = new Date()
          expiresAt.setHours(expiresAt.getHours() + 1)

          const integrationData: any = {
            user_id: session.user.id,
            workspace_id: currentWorkspace?.id || null,
            google_email: userInfo.email,
            google_id: userInfo.id,
            access_token: session.provider_token,
            refresh_token: session.provider_refresh_token || null,
            token_expires_at: expiresAt.toISOString(),
            is_active: true,
            scopes: [
              'https://www.googleapis.com/auth/gmail.readonly',
              'https://www.googleapis.com/auth/calendar.events',
              'https://www.googleapis.com/auth/spreadsheets',
              'https://www.googleapis.com/auth/drive.file',
              'https://www.googleapis.com/auth/drive',
              'https://www.googleapis.com/auth/documents'
            ],
            settings: {
              gmail: { enabled: true, auto_import: true },
              calendar: { enabled: true, sync_tasks: true },
              sheets: { enabled: true },
              drive: { enabled: true },
              docs: { enabled: true }
            }
          }

          console.log('💾 Salvando integração...')

          // Verificar se já existe integração
          let query = supabase
            .from('google_integrations')
            .select('id')
            .eq('user_id', session.user.id)

          if (currentWorkspace?.id) {
            query = query.eq('workspace_id', currentWorkspace.id)
          } else {
            query = query.is('workspace_id', null)
          }

          const { data: existing } = await query.maybeSingle()

          // Se existe, atualizar. Senão, inserir
          if (existing) {
            console.log('🔄 Atualizando integração existente')
            await supabase
              .from('google_integrations')
              .update(integrationData)
              .eq('id', existing.id)
          } else {
            console.log('➕ Criando nova integração')
            await supabase
              .from('google_integrations')
              .insert(integrationData)
          }
          
          console.log('✅ Integração salva com sucesso!')
          // Toast já é mostrado pelo hook useGoogleIntegration
          // NÃO fazer reload - o hook atualiza o estado automaticamente
        } catch (error: any) {
          console.error('❌ Erro ao salvar integração:', error)
          toast.error(`Erro ao conectar: ${error.message}`)
          // Limpar flag em caso de erro
          sessionStorage.removeItem('google_oauth_processed')
        }
      }
    }

    handleGoogleCallback()
  }, [currentWorkspace?.id])

  const loadConfig = async () => {
    try {
      setPageLoading(true)
      const { INTEGRATION_CONFIG } = await import('@/integrations/config')
      setConfig({ ...INTEGRATION_CONFIG })
    } catch (error) {
      console.error('Error loading config:', error)
    } finally {
      setPageLoading(false)
    }
  }

  const handleToggle = (key: string, value: boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const saveConfig = async () => {
    try {
      setSaving(true)
      localStorage.setItem('integration-config', JSON.stringify(config))
      
      // ✨ Disparar evento para atualizar componentes em tempo real
      window.dispatchEvent(new CustomEvent('integration-config-changed', { 
        detail: config 
      }))
      
      setHasChanges(false)
      
      toast.success(t('integrations.configSaved'), {
        description: t('integrations.configSavedDesc'),
      })
      
    } catch (error) {
      toast.error(t('integrations.configError'))
    } finally {
      setSaving(false)
    }
  }

  const IntegrationItem = ({ 
    title, 
    description, 
    settingKey,
    disabled = false,
    icon,
    tooltip
  }: { 
    title: string
    description: string
    settingKey: string
    disabled?: boolean
    icon?: React.ReactNode
    tooltip?: string
  }) => (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="space-y-0.5 flex-1 min-w-0 flex items-start gap-3">
        {icon && (
          <div className="mt-0.5 shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Label htmlFor={settingKey} className="font-medium cursor-pointer text-sm">
              {title}
            </Label>
            {tooltip && (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[250px] text-xs">
                    {tooltip}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
      <Switch
        id={settingKey}
        checked={config[settingKey as keyof typeof config] as boolean}
        onCheckedChange={(checked) => handleToggle(settingKey, checked)}
        className="shrink-0 scale-90"
        disabled={disabled}
      />
    </div>
  )

  return (
    <DashboardLayout>
      <div className="h-full w-full flex flex-col overflow-hidden">
        {/* Header padrão */}
        <div className="flex items-center justify-between gap-2 px-[5px] py-0.5 border-b border-border">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Plug className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-sm font-semibold truncate">{t('integrations.title')}</h2>
          </div>

          <div className="flex items-center gap-0.5">
            <Button 
              onClick={saveConfig} 
              disabled={saving || !hasChanges}
              size="icon"
              variant={hasChanges ? "primary" : "ghost"}
              className="h-7 w-7"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-auto">
          {pageLoading ? (
            <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
              {/* Skeleton de Integrações */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-40" />
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 rounded-lg bg-muted/30 space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-8 w-20 rounded-md" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-5 w-48" />
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={`switch-${i}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-56" />
                    </div>
                    <Skeleton className="h-5 w-9 rounded-full" />
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
          <div className="w-full h-full px-4 md:px-16 py-4 md:py-6">
            <TooltipProvider delayDuration={300}>
              {/* Título principal com fonte maior */}
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{t('integrations.apiRest')}</h1>
                  <p className="text-sm md:text-base text-muted-foreground mt-1">
                    Conecte e gerencie suas integrações externas
                  </p>
                </div>
                
                {/* Botão de configurações no header - abre Dialog */}
                <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="h-8 gap-2"
                        >
                          <Settings2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Configurações</span>
                        </Button>
                      </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Configurações do sistema de integrações internas</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  {/* Dialog de Configurações Internas */}
                  <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-purple-600" />
                        Sistema de Integrações Internas
                      </DialogTitle>
                      <DialogDescription>
                        Configure como os módulos internos se comunicam entre si
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                      {/* Sistema Principal */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          {t('integrations.internalSystem')}
                        </h3>
                        <IntegrationItem
                          title={t('integrations.enableSystem')}
                          description={t('integrations.enableSystemDesc')}
                          settingKey="ENABLED"
                          tooltip="Ativa ou desativa todas as integrações internas do sistema."
                        />
                      </div>

                      {/* Integrações Disponíveis */}
                      <div className="space-y-3 border-t pt-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          {t('integrations.available')}
                        </h3>
                        <IntegrationItem
                          icon={
                            <div className="flex items-center gap-1.5">
                              <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <Wallet className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                          }
                          title={t('integrations.tasksToFinance')}
                          description={t('integrations.tasksToFinanceDesc')}
                          settingKey="TASKS_TO_FINANCE"
                          disabled={!config.ENABLED}
                          tooltip="Tarefas com valores financeiros serão refletidas no módulo financeiro."
                        />
                        <IntegrationItem
                          icon={
                            <div className="flex items-center gap-1.5">
                              <FolderKanban className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <Wallet className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                          }
                          title={t('integrations.projectsToFinance')}
                          description={t('integrations.projectsToFinanceDesc')}
                          settingKey="PROJECTS_TO_FINANCE"
                          disabled={!config.ENABLED}
                          tooltip="Orçamentos de projetos sincronizam com o módulo financeiro."
                        />
                      </div>

                      {/* Opções de Comportamento */}
                      <div className="space-y-3 border-t pt-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          {t('integrations.behaviorOptions')}
                        </h3>
                        <IntegrationItem
                          title={t('integrations.autoCreate')}
                          description={t('integrations.autoCreateDesc')}
                          settingKey="AUTO_CREATE"
                          disabled={!config.ENABLED}
                          tooltip="Cria automaticamente novos registros quando dados são sincronizados."
                        />
                        <IntegrationItem
                          title={t('integrations.notifications')}
                          description={t('integrations.notificationsDesc')}
                          settingKey="SHOW_NOTIFICATIONS"
                          disabled={!config.ENABLED}
                          tooltip="Exibe notificações em cada sincronização automática."
                        />
                        <IntegrationItem
                          title={t('integrations.debugMode')}
                          description={t('integrations.debugModeDesc')}
                          settingKey="DEBUG_MODE"
                          disabled={!config.ENABLED}
                          tooltip="Modo desenvolvedor - registra logs detalhados no console."
                        />
                      </div>

                      {/* Status e botão salvar */}
                      <div className="border-t pt-4 space-y-3">
                        {config.ENABLED && (
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-sm font-medium">{t('integrations.systemActive')}</span>
                          </div>
                        )}
                        <Button 
                          onClick={saveConfig} 
                          disabled={saving || !hasChanges}
                          className="w-full"
                          variant={hasChanges ? "primary" : "secondary"}
                        >
                          {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          {hasChanges ? 'Salvar Alterações' : 'Configurações Salvas'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Layout quando DESCONECTADO - só botão centralizado */}
              {!isGoogleConnected && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-12 md:py-20"
                >
                  <div className="max-w-md w-full">
                    <GoogleIntegrationCard />
                  </div>
                </motion.div>
              )}

              {/* Layout quando CONECTADO - Tabs estilo project-manager */}
              {isGoogleConnected && (
                <Tabs value={activeGoogleTab} onValueChange={setActiveGoogleTab} className="flex flex-col h-full">
                  {/* Tabs e ações - estilo project-manager */}
                  <div className="flex items-center justify-between shrink-0 py-2 border-b">
                    <TabsList variant="transparent" className="border-0 p-0 gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <TabsTrigger 
                            value="connection" 
                            className="text-sm gap-1.5 data-[state=active]:bg-secondary hover:bg-secondary/60 rounded-md transition-colors px-3 py-1.5"
                          >
                            <Link2 className="h-4 w-4" />
                            <span>Conexão</span>
                          </TabsTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p className="font-medium">Status da Conexão</p>
                          <p className="text-muted-foreground text-xs">Gerenciar conexão com Google</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <TabsTrigger 
                            value="gmail" 
                            className="text-sm gap-1.5 data-[state=active]:bg-secondary hover:bg-secondary/60 rounded-md transition-colors px-3 py-1.5"
                          >
                            <Mail className="h-4 w-4" />
                            <span className="hidden sm:inline">Gmail</span>
                          </TabsTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p className="font-medium">Gmail</p>
                          <p className="text-muted-foreground text-xs">Escanear faturas e recibos do email</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <TabsTrigger 
                            value="calendar" 
                            className="text-sm gap-1.5 data-[state=active]:bg-secondary hover:bg-secondary/60 rounded-md transition-colors px-3 py-1.5"
                          >
                            <Calendar className="h-4 w-4" />
                            <span className="hidden sm:inline">Agenda</span>
                          </TabsTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p className="font-medium">Google Agenda</p>
                          <p className="text-muted-foreground text-xs">Sincronizar tarefas com calendário</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <TabsTrigger 
                            value="sheets" 
                            className="text-sm gap-1.5 data-[state=active]:bg-secondary hover:bg-secondary/60 rounded-md transition-colors px-3 py-1.5"
                          >
                            <FileSpreadsheet className="h-4 w-4" />
                            <span className="hidden sm:inline">Planilhas</span>
                          </TabsTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p className="font-medium">Google Planilhas</p>
                          <p className="text-muted-foreground text-xs">Exportar dados financeiros</p>
                        </TooltipContent>
                      </Tooltip>
                    </TabsList>
                  </div>

                  {/* Conteúdo das Tabs */}
                  <div className="flex-1 overflow-auto py-4 md:py-6">
                    <TabsContent value="connection" className="m-0">
                      <div className="max-w-md">
                        <GoogleIntegrationCard />
                      </div>
                    </TabsContent>

                    <TabsContent value="gmail" className="m-0">
                      <GmailInvoiceScanner />
                    </TabsContent>

                    <TabsContent value="calendar" className="m-0">
                      <CalendarSyncPanel />
                    </TabsContent>

                    <TabsContent value="sheets" className="m-0">
                      <SheetsExportDialog />
                    </TabsContent>
                  </div>
                </Tabs>
              )}
            </TooltipProvider>
          </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
