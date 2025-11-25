import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2, FileSpreadsheet, ExternalLink, Download } from 'lucide-react'
import { SheetsService } from '@/services/google/sheets.service'
import { toast } from 'sonner'
import { useWorkspace } from '@/contexts/workspace-context'
import { motion } from 'framer-motion'

/**
 * 📊 Sheets Export Dialog
 * Exportar dados para Google Sheets
 * 
 * Funcionalidades:
 * - Exportar relatório financeiro mensal
 * - Exportar lista de tasks
 * - Abrir planilha criada automaticamente
 */

export function SheetsExportDialog() {
  const { currentWorkspace } = useWorkspace()
  const [exporting, setExporting] = useState(false)
  const [exportType, setExportType] = useState<'finance' | 'tasks' | null>(null)
  const [lastExportUrl, setLastExportUrl] = useState<string | null>(null)

  const handleExportFinance = async () => {
    try {
      setExporting(true)
      setExportType('finance')
      toast.info('📊 Criando planilha financeira...')

      const now = new Date()
      const month = now.getMonth() + 1
      const year = now.getFullYear()

      const url = await SheetsService.exportFinanceReport(
        month,
        year,
        currentWorkspace?.id
      )

      if (url) {
        setLastExportUrl(url)
        toast.success('✅ Planilha criada com sucesso!')
        
        // Abrir em nova aba
        window.open(url, '_blank')
      } else {
        toast.error('Erro ao criar planilha')
      }
    } catch (error: any) {
      console.error('Erro ao exportar:', error)
      
      // Se for erro 403, avisar sobre permissões
      if (error.message?.includes('403') || error.message?.includes('Erro ao criar planilha')) {
        toast.error('❌ Sem permissão! Você precisa RECONECTAR o Google com as novas permissões.', {
          duration: 8000,
          description: 'Vá em Integrações → Desconectar Google → Conectar novamente'
        })
      } else {
        toast.error('Erro ao exportar: ' + error.message)
      }
    } finally {
      setExporting(false)
      setExportType(null)
    }
  }

  const handleExportTasks = async () => {
    try {
      setExporting(true)
      setExportType('tasks')
      toast.info('📋 Criando planilha de tasks...')

      const url = await SheetsService.exportTasks(
        currentWorkspace?.id
      )

      if (url) {
        setLastExportUrl(url)
        toast.success('✅ Planilha criada com sucesso!')
        
        // Abrir em nova aba
        window.open(url, '_blank')
      } else {
        toast.error('Erro ao criar planilha')
      }
    } catch (error: any) {
      console.error('Erro ao exportar:', error)
      
      // Se for erro 403, avisar sobre permissões
      if (error.message?.includes('403') || error.message?.includes('Erro ao criar planilha')) {
        toast.error('❌ Sem permissão! Você precisa RECONECTAR o Google com as novas permissões.', {
          duration: 8000,
          description: 'Vá em Integrações → Desconectar Google → Conectar novamente'
        })
      } else {
        toast.error('Erro ao exportar: ' + error.message)
      }
    } finally {
      setExporting(false)
      setExportType(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Exportar para Google Sheets
        </CardTitle>
        <CardDescription>
          Crie planilhas automáticas com seus dados
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Exportar Finance */}
          <Dialog>
            <DialogTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-3">
                      <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <FileSpreadsheet className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Relatório Financeiro</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Exportar receitas e despesas do mês
                        </p>
                      </div>
                      <Button className="w-full" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Exportar Relatório Financeiro</DialogTitle>
                <DialogDescription>
                  Será criada uma planilha com todas as transações financeiras do mês atual
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">O que será incluído:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>✅ Todas as receitas</li>
                    <li>✅ Todas as despesas</li>
                    <li>✅ Categorias e métodos de pagamento</li>
                    <li>✅ Status e datas</li>
                    <li>✅ Valores formatados em R$</li>
                  </ul>
                </div>

                <Button
                  onClick={handleExportFinance}
                  disabled={exporting && exportType === 'finance'}
                  className="w-full"
                >
                  {exporting && exportType === 'finance' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando planilha...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Criar Planilha
                    </>
                  )}
                </Button>

                {lastExportUrl && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                      ✅ Planilha criada com sucesso!
                    </p>
                    <Button
                      onClick={() => window.open(lastExportUrl, '_blank')}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Abrir Planilha
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Exportar Tasks */}
          <Dialog>
            <DialogTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-3">
                      <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Lista de Tasks</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Exportar todas as tasks do projeto
                        </p>
                      </div>
                      <Button className="w-full" size="sm" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Exportar Lista de Tasks</DialogTitle>
                <DialogDescription>
                  Será criada uma planilha com todas as tasks do workspace
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">O que será incluído:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>✅ Título e descrição</li>
                    <li>✅ Status e prioridade</li>
                    <li>✅ Datas de início e fim</li>
                    <li>✅ Responsáveis</li>
                    <li>✅ Tags e categorias</li>
                  </ul>
                </div>

                <Button
                  onClick={handleExportTasks}
                  disabled={exporting && exportType === 'tasks'}
                  className="w-full"
                >
                  {exporting && exportType === 'tasks' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando planilha...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Criar Planilha
                    </>
                  )}
                </Button>

                {lastExportUrl && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                      ✅ Planilha criada com sucesso!
                    </p>
                    <Button
                      onClick={() => window.open(lastExportUrl, '_blank')}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Abrir Planilha
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info */}
        <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>💡 Dica:</strong> As planilhas criadas ficam salvas no seu
            Google Drive e podem ser compartilhadas com sua equipe.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
