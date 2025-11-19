import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ResizableCard } from '@/components/ui/resizable-card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FolderKanban,
  Plus,
  MoreVertical,
  Copy,
  Trash2,
  GripVertical,
  Maximize2,
  Users,
  FileText,
  CheckSquare,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useWorkspace } from '@/contexts/workspace-context'
import { useRealtimeProjects } from '@/hooks/use-realtime-projects'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ProjectsCardProps {
  workspaceId?: string
  dragHandleProps?: any
}

interface Project {
  id: string
  name: string
  description: string | null
  status: 'active' | 'completed' | 'archived'
  workspace_id: string
  user_id: string
  created_at: string
  updated_at: string
}

export function ProjectsCard({ workspaceId, dragHandleProps }: ProjectsCardProps) {
  const { currentWorkspace } = useWorkspace()
  const finalWorkspaceId = workspaceId || currentWorkspace?.id

  const [cardName, setCardName] = useState(() => {
    return localStorage.getItem('projects-card-name') || 'Projetos'
  })
  const [isEditingName, setIsEditingName] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  // Função para carregar projetos
  const loadProjects = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('projects')
        .select('*');

      // Se finalWorkspaceId for null (modo Pessoal), buscar projetos sem workspace
      if (finalWorkspaceId === null || finalWorkspaceId === undefined) {
        query = query.is('workspace_id', null);
      } else {
        query = query.eq('workspace_id', finalWorkspaceId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error
      setProjects(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar projetos:', error)
      toast.error('Erro ao carregar projetos')
    } finally {
      setLoading(false)
    }
  }, [finalWorkspaceId])

  // Salvar nome no localStorage
  useEffect(() => {
    localStorage.setItem('projects-card-name', cardName)
  }, [cardName])

  // Realtime para atualizar lista quando houver mudanças
  useRealtimeProjects(finalWorkspaceId || null, {
    enabled: !!finalWorkspaceId,
    showNotifications: false, // Não mostrar toast (já mostra no onboarding)
    onUpdate: loadProjects,
  })

  // Carregar projetos
  useEffect(() => {
    if (!finalWorkspaceId) return
    loadProjects()
  }, [finalWorkspaceId, loadProjects])

  const handleDeleteCard = () => {
    if (confirm('Tem certeza que deseja remover este card?')) {
      const event = new CustomEvent('delete-card', { detail: 'projects-card' })
      window.dispatchEvent(event)
      toast.success('Card removido')
    }
  }

  const handleDuplicateCard = () => {
    toast.info('Funcionalidade em desenvolvimento')
  }

  const statusColors = {
    active: 'bg-green-500',
    completed: 'bg-blue-500',
    archived: 'bg-gray-500',
  }

  const statusLabels = {
    active: 'Ativo',
    completed: 'Concluído',
    archived: 'Arquivado',
  }

  return (
    <>
      <ResizableCard
        defaultWidth={450}
        defaultHeight={400}
        minWidth={350}
        minHeight={350}
        maxWidth={600}
        maxHeight={500}
        storageKey={`projects-card-${finalWorkspaceId || 'default'}`}
      >
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Drag Handle */}
              <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Ícone */}
              <motion.div
                whileHover={{ rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <FolderKanban className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
              </motion.div>

              {/* Badge de Contagem */}
              {projects.length > 0 && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <Badge variant="secondary" className="text-xs h-5 px-1.5">
                    {projects.length}
                  </Badge>
                </motion.div>
              )}

              {/* Nome Editável */}
              {isEditingName ? (
                <Input
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setIsEditingName(false)
                  }}
                  className="h-7 text-sm font-semibold bg-transparent border-none focus:border-border focus:ring-1 focus:ring-ring px-2 w-full max-w-[160px] sm:max-w-[200px] truncate"
                  autoFocus
                />
              ) : (
                <h3
                  className="font-semibold text-sm cursor-pointer hover:text-primary truncate"
                  onClick={() => setIsEditingName(true)}
                >
                  {cardName}
                </h3>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center gap-1 shrink-0">
              {projects.length > 0 && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs hover:bg-accent/60"
                    onClick={() => setIsExpanded(true)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Novo
                  </Button>
                </motion.div>
              )}

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-accent/60"
                  onClick={() => setIsExpanded(true)}
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
              </motion.div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-accent/60">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDuplicateCard}>
                    <Copy className="mr-2 h-3.5 w-3.5" />
                    Duplicar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDeleteCard} className="text-destructive">
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Remover
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-auto">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center h-full text-center p-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-3"
                >
                  <FolderKanban className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </motion.div>
                <h3 className="font-medium text-sm mb-1">Nenhum projeto ainda</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Projetos organizam tarefas, documentos e progresso
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="sm" onClick={() => setIsExpanded(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar projeto
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <div className="space-y-2">
                {projects.slice(0, 5).map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="group p-3 rounded-lg border bg-card hover:bg-accent/50 transition-all cursor-pointer shadow-sm hover:shadow-md"
                    onClick={() => setIsExpanded(true)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-1 h-full rounded-full",
                        statusColors[project.status]
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{project.name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {statusLabels[project.status]}
                          </Badge>
                        </div>
                        {project.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {project.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CheckSquare className="h-3 w-3" />
                            0 tarefas
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            0 docs
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            1
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {projects.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => setIsExpanded(true)}
                  >
                    Ver todos ({projects.length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </ResizableCard>

      {/* Dialog Expandido */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-6xl h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5" />
              Projetos
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FolderKanban className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Funcionalidade em Desenvolvimento</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                A visualização completa de projetos está sendo desenvolvida.
                Em breve você poderá organizar tarefas, documentos e acompanhar o progresso aqui!
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => setIsExpanded(false)}>
                  Fechar
                </Button>
                <Button onClick={() => toast.info('Em breve!')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Projeto
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
