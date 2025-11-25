import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Loader2, Calendar, CheckCircle2, XCircle, RefreshCw, Download, ArrowDownToLine } from 'lucide-react'
import { CalendarService, type CalendarEvent } from '@/services/google/calendar.service'
import { toast } from 'sonner'
import { useWorkspace } from '@/contexts/workspace-context'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 📅 Calendar Sync Panel
 * Sincronizar Tasks com Google Calendar
 * 
 * Funcionalidades:
 * - Habilitar/desabilitar sync automático
 * - Sincronizar todas as tasks com due_date
 * - Ver status de sincronização
 * - Desvincular tasks
 */

interface Task {
  id: string
  title: string
  due_date?: string
  start_date?: string
  status: 'todo' | 'in_progress' | 'done'
  calendar_event_id?: string
}

export function CalendarSyncPanel() {
  const { currentWorkspace } = useWorkspace()
  const [autoSync, setAutoSync] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [syncedCount, setSyncedCount] = useState(0)
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([])
  const [showImport, setShowImport] = useState(false)

  // Carregar tasks com due_date
  useEffect(() => {
    loadTasks()
  }, [currentWorkspace?.id])

  const loadTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Query simplificada - buscar todas as tasks do usuário com due_date
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, due_date, start_date, status, calendar_event_id')
        .eq('created_by', user.id)
        .not('due_date', 'is', null)
        .order('due_date', { ascending: true })

      if (error) {
        console.error('❌ Erro na query:', error)
        console.error('📋 Detalhes:', JSON.stringify(error, null, 2))
        console.error('🔍 Message:', error.message)
        console.error('🔍 Code:', error.code)
        throw error
      }

      console.log('✅ Tasks carregadas:', data?.length || 0, 'tasks com due_date')
      setTasks(data || [])
      setSyncedCount(data?.filter(t => t.calendar_event_id).length || 0)
    } catch (error) {
      console.error('Erro ao carregar tasks:', error)
      toast.error('Erro ao carregar tasks. Verifique o console.')
    }
  }

  const handleSyncAll = async () => {
    try {
      setSyncing(true)
      toast.info('🔄 Sincronizando tasks com Google Calendar...')

      let successCount = 0
      let errorCount = 0

      for (const task of tasks) {
        try {
          const eventId = await CalendarService.syncTaskToCalendar(
            task,
            currentWorkspace?.id
          )

          if (eventId) {
            // Atualizar task com event_id
            await supabase
              .from('tasks')
              .update({ calendar_event_id: eventId })
              .eq('id', task.id)

            successCount++
          }
        } catch (error) {
          console.error('Erro task:', task.id, error)
          errorCount++
        }
      }

      await loadTasks()

      if (successCount > 0) {
        toast.success(`✅ ${successCount} task(s) sincronizada(s)!`)
      }

      if (errorCount > 0) {
        toast.warning(`⚠️ ${errorCount} task(s) com erro`)
      }
    } catch (error: any) {
      console.error('Erro ao sincronizar:', error)
      toast.error('Erro ao sincronizar tasks')
    } finally {
      setSyncing(false)
    }
  }

  const handleUnsyncTask = async (task: Task) => {
    if (!task.calendar_event_id) return

    try {
      // Deletar evento do Calendar
      const success = await CalendarService.unsyncTask(
        task.calendar_event_id,
        currentWorkspace?.id
      )

      if (success) {
        // Remover event_id da task
        await supabase
          .from('tasks')
          .update({ calendar_event_id: null })
          .eq('id', task.id)

        toast.success('✅ Task desvinculada do Calendar')
        await loadTasks()
      } else {
        toast.error('Erro ao desvincular task')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao desvincular task')
    }
  }

  // Carregar eventos do Google Calendar
  const loadUpcomingEvents = async () => {
    try {
      const events = await CalendarService.getUpcomingEvents(14, currentWorkspace?.id)
      
      // Filtrar eventos que já estão sincronizados
      const { data: existingTasks } = await supabase
        .from('tasks')
        .select('calendar_event_id')
        .not('calendar_event_id', 'is', null)
      
      const syncedIds = new Set(existingTasks?.map(t => t.calendar_event_id) || [])
      const newEvents = events.filter(e => !syncedIds.has(e.id))
      
      setUpcomingEvents(newEvents)
      setShowImport(true)
      
      if (newEvents.length === 0) {
        toast.info('Todos os eventos já estão sincronizados!')
      } else {
        toast.success(`${newEvents.length} evento(s) disponíveis para importar`)
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
      toast.error('Erro ao carregar eventos do Calendar')
    }
  }

  // Importar eventos como tasks
  const handleImportEvents = async () => {
    try {
      setImporting(true)
      toast.info('📥 Importando eventos do Calendar...')

      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 30) // Próximos 30 dias

      const result = await CalendarService.importEventsAsTasks(
        startDate,
        endDate,
        undefined,
        currentWorkspace?.id
      )

      if (result.imported > 0) {
        toast.success(`✅ ${result.imported} evento(s) importado(s) como tasks!`)
      }
      
      if (result.skipped > 0) {
        toast.info(`${result.skipped} evento(s) já sincronizados`)
      }

      // Recarregar dados
      await loadTasks()
      setShowImport(false)
      setUpcomingEvents([])
    } catch (error: any) {
      console.error('Erro ao importar:', error)
      toast.error('Erro ao importar eventos')
    } finally {
      setImporting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sincronizar com Google Calendar
            </CardTitle>
            <CardDescription>
              Tasks com data de vencimento viram eventos no Calendar
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Auto-sync:</span>
              <Switch
                checked={autoSync}
                onCheckedChange={setAutoSync}
              />
            </div>

            <Button
              onClick={handleSyncAll}
              disabled={syncing || tasks.length === 0}
              size="sm"
              title={tasks.length === 0 ? 'Crie tasks com data de vencimento para sincronizar' : 'Sincronizar todas as tasks pendentes'}
            >
              {syncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sincronizar Tudo
                  {tasks.length === 0 && ' (0 tasks)'}
                </>
              )}
            </Button>

            <Button
              onClick={loadUpcomingEvents}
              disabled={importing}
              size="sm"
              variant="outline"
              title="Importar eventos do Google Calendar como tasks"
            >
              <ArrowDownToLine className="mr-2 h-4 w-4" />
              Importar do Calendar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">{tasks.length}</div>
            <div className="text-xs text-muted-foreground">Tasks com data</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{syncedCount}</div>
            <div className="text-xs text-muted-foreground">Sincronizadas</div>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {tasks.length - syncedCount}
            </div>
            <div className="text-xs text-muted-foreground">Pendentes</div>
          </div>
        </div>

        {/* Lista de tasks */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Nenhuma task com data de vencimento</p>
              <p className="text-xs mt-2">
                💡 Crie tasks com <strong>Data Fim</strong> para sincronizar com o Calendar
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-3 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">{task.title}</h4>
                      {task.calendar_event_id ? (
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          Sincronizado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <XCircle className="h-3 w-3 text-orange-500" />
                          Não sincronizado
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      {task.start_date && (
                        <span>📅 Início: {new Date(task.start_date).toLocaleDateString('pt-BR')}</span>
                      )}
                      {task.due_date && (
                        <span>⏰ Fim: {new Date(task.due_date).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                  </div>

                  {task.calendar_event_id && (
                    <Button
                      onClick={() => handleUnsyncTask(task)}
                      size="sm"
                      variant="ghost"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Eventos para importar */}
        <AnimatePresence>
          {showImport && upcomingEvents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 border rounded-lg p-4 bg-purple-50 dark:bg-purple-950/20"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Download className="h-4 w-4 text-purple-600" />
                  Eventos disponíveis ({upcomingEvents.length})
                </h4>
                <div className="flex gap-2">
                  <Button
                    onClick={handleImportEvents}
                    disabled={importing}
                    size="sm"
                  >
                    {importing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Importar Todos
                  </Button>
                  <Button
                    onClick={() => setShowImport(false)}
                    size="sm"
                    variant="ghost"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="flex items-center justify-between p-2 bg-white dark:bg-background rounded border">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{event.summary}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.start.dateTime).toLocaleDateString('pt-BR')} às {new Date(event.start.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {event.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info */}
        <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>💡 Sync Bidirecional:</strong> Tasks com data viram eventos no Calendar.
            Use "Importar do Calendar" para trazer eventos como tasks.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
