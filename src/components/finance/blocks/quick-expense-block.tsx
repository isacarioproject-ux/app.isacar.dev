import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { FinanceBlockProps } from '@/types/finance-blocks'
import { useI18n } from '@/hooks/use-i18n'
import { useIntegration } from '@/hooks/use-integration'

interface QuickExpenseBlockProps extends FinanceBlockProps {
  categories: string[]
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Bloco para adicionar despesas rapidamente
 * Tabela inline editável estilo Notion
 */
export const QuickExpenseBlock = ({
  documentId,
  categories,
  onRefresh,
}: QuickExpenseBlockProps) => {
  const { t } = useI18n()
  const isTaskIntegrationEnabled = useIntegration('TASKS_TO_FINANCE') // ✨ Verificar se integração está ativa
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [taskId, setTaskId] = useState<string>('') // ✨ Vinculação com task
  const [tasks, setTasks] = useState<any[]>([]) // ✨ Lista de tasks disponíveis
  const [loading, setLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  
  // Estados para edição inline
  const [editingCell, setEditingCell] = useState<{field: string} | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [selectOpen, setSelectOpen] = useState(false)

  useEffect(() => {
    // Simular inicialização rápida
    const timer = setTimeout(() => {
      setIsInitializing(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  // ✨ Carregar tasks disponíveis
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('id, title, status')
          .order('created_at', { ascending: false })
          .limit(100) // Mostrar todas as tasks
        
        if (error) throw error
        setTasks(data || [])
      } catch (err) {
        console.error('Erro ao carregar tasks:', err)
      }
    }
    
    loadTasks()
  }, [])

  const handleQuickAdd = async () => {
    // Validações
    if (!amount || !category) {
      toast.error(t('finance.quickExpense.fillValueCategory'))
      return
    }

    const parsedAmount = parseFloat(amount.replace(',', '.'))
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error(t('finance.quickExpense.invalidValue'))
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('finance_transactions').insert({
        finance_document_id: documentId,
        task_id: (taskId && taskId !== 'none') ? taskId : null, // ✨ Vinculação com task
        type: 'expense',
        category: category,
        description: `${t('finance.quickExpense.quickExpense')} - ${category}`,
        amount: parsedAmount,
        transaction_date: format(new Date(), 'yyyy-MM-dd'),
        payment_method: 'cash',
        status: 'completed',
        tags: [],
      })

      if (error) throw error

      // Reset
      setAmount('')
      setCategory('')
      setTaskId('') // ✨ Reset task vinculada
      setEditingCell(null)
      setEditingValue('')
      
      onRefresh()
      toast.success(`${formatCurrency(parsedAmount)} ${t('finance.quickExpense.added')}`)
    } catch (err: any) {
      toast.error(t('finance.table.errorAdd'), {
        description: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCellEdit = (e: React.MouseEvent, field: string, currentValue: string) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingCell({ field })
    // Para o campo amount, mostrar o valor sem formatação para edição
    if (field === 'amount') {
      setEditingValue(currentValue || '')
    } else {
      setEditingValue(currentValue || '')
    }
    if (field === 'category') {
      setSelectOpen(true)
    }
  }

  const handleCellSave = (field: string) => {
    if (field === 'category') {
      if (editingValue.trim()) {
        setCategory(editingValue.trim())
      }
    } else if (field === 'amount') {
      // Limpar e normalizar o valor
      const cleanedValue = editingValue.trim().replace(/[^0-9,.-]/g, '')
      if (cleanedValue) {
        setAmount(cleanedValue)
      }
    }
    setEditingCell(null)
    setEditingValue('')
  }

  // Skeleton
  if (isInitializing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border rounded-lg overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="h-8">
              <TableHead className="h-8 text-xs">
                <Skeleton className="h-3 w-20" />
              </TableHead>
              <TableHead className="h-8 text-xs text-right">
                <Skeleton className="h-3 w-24 ml-auto" />
              </TableHead>
              <TableHead className="h-8 w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="h-8">
              <TableCell className="text-xs py-0 px-2">
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="text-xs py-0 px-2 text-right">
                <Skeleton className="h-4 w-20 ml-auto" />
              </TableCell>
              <TableCell className="text-xs py-0 px-1">
                <Skeleton className="h-6 w-6 rounded" />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border rounded-lg overflow-hidden"
    >
      <Table>
        <TableHeader>
          <TableRow className="h-8">
            <TableHead className="h-8 text-xs">{t('finance.table.category')}</TableHead>
            {isTaskIntegrationEnabled && (
              <TableHead className="h-8 text-xs">Task</TableHead>
            )}
            <TableHead className="h-8 text-xs text-right">{t('finance.budget.value')}</TableHead>
            <TableHead className="h-8 w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow 
            className="h-8"
            onMouseDown={(e) => {
              // Permitir cliques nas células editáveis
              const target = e.target as HTMLElement
              if (target.closest('.cursor-text') || target.closest('input') || target.closest('[role="combobox"]')) {
                return
              }
              e.stopPropagation()
            }}
          >
            {/* Categoria - Editável inline */}
            <TableCell className="text-xs py-0 px-2">
              <AnimatePresence mode="wait">
                {editingCell?.field === 'category' ? (
                  <motion.div
                    key="edit-category"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Select
                      value={category}
                      open={selectOpen}
                      onOpenChange={(open) => {
                        setSelectOpen(open)
                        if (!open) {
                          setEditingCell(null)
                          setEditingValue('')
                        }
                      }}
                      onValueChange={(value) => {
                        setCategory(value)
                        setSelectOpen(false)
                        setEditingCell(null)
                        setEditingValue('')
                      }}
                    >
                      <SelectTrigger className="h-7 text-xs border-none p-1 focus-visible:ring-1">
                        <SelectValue placeholder={t('finance.table.category')} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            {t('finance.table.noCategory')}
                          </div>
                        ) : (
                          categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </motion.div>
                ) : (
                  <motion.div
                    key="display-category"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={(e) => handleCellEdit(e, 'category', category)}
                    className="cursor-text hover:bg-muted/50 px-1 py-0.5 rounded min-h-[28px] flex items-center transition-colors"
                  >
                    {category || (
                      <span className="text-muted-foreground italic">
                        {t('finance.table.category')}...
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </TableCell>

            {/* Task - Editável inline (somente se integração ativa) */}
            {isTaskIntegrationEnabled && (
            <TableCell className="text-xs py-0 px-2">
              <AnimatePresence mode="wait">
                {editingCell?.field === 'task' ? (
                  <motion.div
                    key="edit-task"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Select
                      value={taskId || 'none'}
                      open={selectOpen}
                      onOpenChange={(open) => {
                        setSelectOpen(open)
                        if (!open) {
                          setEditingCell(null)
                          setEditingValue('')
                        }
                      }}
                      onValueChange={(value) => {
                        setTaskId(value === 'none' ? '' : value)
                        setSelectOpen(false)
                        setEditingCell(null)
                        setEditingValue('')
                      }}
                    >
                      <SelectTrigger className="h-7 text-xs border-none p-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {tasks.map((task) => (
                          <SelectItem key={task.id} value={task.id}>
                            <div className="flex items-center gap-2">
                              {task.status === 'done' && <span className="text-green-600">✓</span>}
                              <span className={task.status === 'done' ? 'line-through text-muted-foreground' : ''}>
                                {task.title}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                ) : (
                  <motion.div
                    key="display-task"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={(e) => handleCellEdit(e, 'task', taskId)}
                    className="cursor-text hover:bg-muted/50 px-1 py-0.5 rounded min-h-[28px] flex items-center gap-1.5 transition-colors"
                  >
                    {taskId && tasks.find(t => t.id === taskId) ? (
                      <>
                        {tasks.find(t => t.id === taskId)?.status === 'done' && (
                          <span className="text-green-600 text-xs">✓</span>
                        )}
                        <span className={`truncate ${tasks.find(t => t.id === taskId)?.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                          {tasks.find(t => t.id === taskId)?.title}
                        </span>
                      </>
                    ) : (
                      <span className="text-muted-foreground italic text-xs">Task...</span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </TableCell>
            )}

            {/* Valor - Editável inline */}
            <TableCell className="text-xs text-right font-mono py-0 px-2">
              <AnimatePresence mode="wait">
                {editingCell?.field === 'amount' ? (
                  <motion.div
                    key="edit-amount"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="flex justify-end"
                  >
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={editingValue}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9,.-]/g, '')
                        setEditingValue(value)
                      }}
                      onBlur={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        // Salvar o valor quando sair do campo
                        const cleanedValue = editingValue.trim().replace(/[^0-9,.-]/g, '')
                        if (cleanedValue) {
                          setAmount(cleanedValue)
                        }
                        setEditingCell(null)
                        setEditingValue('')
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          e.stopPropagation()
                          // Salvar o valor quando pressionar Enter
                          const cleanedValue = editingValue.trim().replace(/[^0-9,.-]/g, '')
                          if (cleanedValue) {
                            setAmount(cleanedValue)
                          }
                          setEditingCell(null)
                          setEditingValue('')
                        }
                        if (e.key === 'Escape') {
                          e.preventDefault()
                          e.stopPropagation()
                          setEditingCell(null)
                          setEditingValue(amount) // Restaurar valor original
                        }
                      }}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      className="h-7 text-xs border-none p-1 focus-visible:ring-1 text-right w-full max-w-[120px]"
                      autoFocus
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="display-amount"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleCellEdit(e, 'amount', amount)
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    className="cursor-text hover:bg-muted/50 px-1 py-0.5 rounded min-h-[28px] flex items-center justify-end font-semibold transition-colors w-full"
                  >
                    {amount ? (
                      <span className="text-red-600">
                        {formatCurrency(parseFloat(amount.replace(',', '.')) || 0)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">
                        {t('finance.quickExpense.currencyPlaceholder')}
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </TableCell>

            {/* Botão adicionar */}
            <TableCell className="text-xs py-0 px-1">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  type="button"
                  disabled={loading || !amount || !category}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleQuickAdd()
                  }}
                >
                  {loading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Plus className="h-3 w-3" />
                  )}
                </Button>
              </motion.div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </motion.div>
  )
}
