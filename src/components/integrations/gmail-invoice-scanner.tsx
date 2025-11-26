import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Loader2, Mail, Download, CheckCircle2, AlertCircle, DollarSign, Calendar, Edit2 } from 'lucide-react'
import { GmailService, type GmailMessage } from '@/services/google/gmail.service'
import { toast } from 'sonner'
import { useWorkspace } from '@/contexts/workspace-context'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { nanoid } from 'nanoid'
import { useI18n } from '@/hooks/use-i18n'

/**
 * 📧 Gmail Invoice Scanner
 * Componente para escanear e importar boletos/faturas do Gmail
 * 
 * Funcionalidade estilo Notion/Expensify:
 * - Lista emails com anexos PDF de faturas
 * - Preview dos dados extraídos
 * - Importação com um clique
 * - Marca email como processado
 */

// Extrair valor monetário de texto
const extractAmount = (text: string): number => {
  // Padrões comuns: R$ 123,45 | R$123.45 | 123,45 | BRL 123.45
  const patterns = [
    /R\$\s*([\d.,]+)/i,
    /BRL\s*([\d.,]+)/i,
    /valor[:\s]*([\d.,]+)/i,
    /total[:\s]*([\d.,]+)/i,
    /([\d]{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      // Converter formato BR (1.234,56) para número
      let value = match[1].replace(/\./g, '').replace(',', '.')
      const num = parseFloat(value)
      if (!isNaN(num) && num > 0 && num < 1000000) {
        return num
      }
    }
  }
  return 0
}

// Extrair data de vencimento
const extractDueDate = (text: string): string => {
  // Padrões: 25/12/2024 | 25-12-2024 | vencimento: 25/12
  const patterns = [
    /vencimento[:\s]*(\d{2}[\/\-]\d{2}[\/\-]\d{2,4})/i,
    /venc[:\s]*(\d{2}[\/\-]\d{2}[\/\-]\d{2,4})/i,
    /(\d{2}[\/\-]\d{2}[\/\-]\d{4})/
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const parts = match[1].split(/[\/\-]/)
      if (parts.length >= 3) {
        const year = parts[2].length === 2 ? '20' + parts[2] : parts[2]
        return `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
      }
    }
  }
  
  // Default: próximo mês
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  return nextMonth.toISOString().split('T')[0]
}

// Detectar categoria pelo remetente/assunto
const detectCategory = (from: string, subject: string): string => {
  const text = (from + ' ' + subject).toLowerCase()
  
  if (text.includes('energia') || text.includes('enel') || text.includes('cemig') || text.includes('cpfl') || text.includes('light')) return 'Energia'
  if (text.includes('água') || text.includes('saneamento') || text.includes('sabesp') || text.includes('copasa')) return 'Água'
  if (text.includes('internet') || text.includes('telefone') || text.includes('vivo') || text.includes('claro') || text.includes('tim') || text.includes('oi')) return 'Internet/Telefone'
  if (text.includes('gás') || text.includes('comgas')) return 'Gás'
  if (text.includes('aluguel') || text.includes('condomínio') || text.includes('iptu')) return 'Moradia'
  if (text.includes('cartão') || text.includes('nubank') || text.includes('itaú') || text.includes('bradesco') || text.includes('santander')) return 'Cartão de Crédito'
  if (text.includes('seguro')) return 'Seguro'
  if (text.includes('escola') || text.includes('faculdade') || text.includes('curso')) return 'Educação'
  
  return 'Contas'
}

export function GmailInvoiceScanner() {
  const { t } = useI18n()
  const { currentWorkspace } = useWorkspace()
  const [scanning, setScanning] = useState(false)
  const [messages, setMessages] = useState<GmailMessage[]>([])
  const [importing, setImporting] = useState<string | null>(null)
  const [editingAmount, setEditingAmount] = useState<string | null>(null)
  const [customAmounts, setCustomAmounts] = useState<Record<string, number>>({})

  const handleScan = async () => {
    try {
      setScanning(true)
      toast.info(`🔍 ${t('gmail.scanningGmail')}`)

      const results = await GmailService.searchInvoices(currentWorkspace?.id)
      
      setMessages(results)
      
      if (results.length === 0) {
        toast.info(t('gmail.noInvoices'))
      } else {
        toast.success(`✅ ${results.length} ${t('gmail.invoicesFound')}`)
      }
    } catch (error: any) {
      console.error('Erro ao escanear:', error)
      toast.error(`${t('gmail.errorScan')}: ${error.message}`)
    } finally {
      setScanning(false)
    }
  }

  const handleImport = async (message: GmailMessage) => {
    try {
      setImporting(message.id)
      toast.info(`📥 ${t('gmail.importingInvoice')}`)

      // 1. Buscar anexos
      const attachments = await GmailService.getAttachments(
        message.id,
        currentWorkspace?.id
      )

      if (attachments.length === 0) {
        toast.error(t('gmail.noAttachment'))
        return
      }

      // 2. Download do PDF
      const pdfAttachment = attachments.find(att => att.mimeType === 'application/pdf')
      if (!pdfAttachment) {
        toast.error(t('gmail.noPdf'))
        return
      }

      const pdfData = await GmailService.downloadAttachment(
        message.id,
        pdfAttachment.attachmentId,
        currentWorkspace?.id
      )

      if (!pdfData) {
        toast.error(t('gmail.errorDownload'))
        return
      }

      // 3. Extrair dados do email (subject/snippet)
      const textContent = `${message.subject} ${message.snippet}`
      const amount = customAmounts[message.id] || extractAmount(textContent)
      const dueDate = extractDueDate(textContent)
      const category = detectCategory(message.from, message.subject)
      
      if (amount <= 0) {
        toast.error(t('gmail.noValueDetected'))
        setEditingAmount(message.id)
        return
      }

      // 4. Buscar ou criar documento financeiro padrão
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      // Buscar documento "Importados do Gmail" ou criar
      let { data: financeDoc } = await supabase
        .from('finance_documents')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', 'Importados do Gmail')
        .maybeSingle()

      if (!financeDoc) {
        const { data: newDoc } = await supabase
          .from('finance_documents')
          .insert({
            user_id: user.id,
            workspace_id: currentWorkspace?.id || null,
            name: 'Importados do Gmail',
            description: 'Boletos e faturas importados automaticamente do Gmail',
            currency: 'BRL'
          })
          .select('id')
          .single()
        financeDoc = newDoc
      }

      if (!financeDoc) throw new Error('Erro ao criar documento')

      // 5. Criar transação
      const { error: txError } = await supabase
        .from('finance_transactions')
        .insert({
          id: nanoid(),
          finance_document_id: financeDoc.id,
          type: 'expense',
          category: category,
          description: message.subject.substring(0, 200),
          amount: amount,
          transaction_date: dueDate,
          status: 'pending',
          payment_method: 'boleto',
          notes: `Importado do Gmail em ${new Date().toLocaleDateString('pt-BR')}\nDe: ${message.from}`,
          tags: ['gmail-import', 'boleto']
        })

      if (txError) throw txError

      // 6. Marcar email como processado (opcional - não falha se der erro)
      await GmailService.addLabel(
        message.id,
        'ISACAR_IMPORTED',
        currentWorkspace?.id
      )

      toast.success(`✅ ${t('gmail.invoiceImported')} R$ ${amount.toFixed(2)}`, {
        description: `${t('gmail.category')}: ${category} | ${t('gmail.dueDate')}: ${new Date(dueDate).toLocaleDateString('pt-BR')}`
      })
      
      // Remover da lista
      setMessages(prev => prev.filter(m => m.id !== message.id))
    } catch (error: any) {
      console.error('Erro ao importar:', error)
      toast.error(t('gmail.errorImport'))
    } finally {
      setImporting(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t('gmail.title')}
            </CardTitle>
            <CardDescription>
              {t('gmail.description')}
            </CardDescription>
          </div>
          
          <Button
            onClick={handleScan}
            disabled={scanning}
            size="sm"
          >
            {scanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('gmail.scanning')}
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                {t('gmail.scan')}
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 text-muted-foreground"
            >
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('gmail.clickToScan')}</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{message.subject}</h4>
                        {message.hasAttachments && (
                          <Badge variant="outline" className="text-xs">
                            <Download className="h-3 w-3 mr-1" />
                            PDF
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {t('gmail.from')}: {message.from}
                      </p>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {message.snippet}
                      </p>
                      
                      {/* Info extraída */}
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        {/* Valor detectado */}
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-green-600" />
                          {editingAmount === message.id ? (
                            <Input
                              type="number"
                              step="0.01"
                              className="h-6 w-24 text-xs"
                              placeholder="Valor"
                              defaultValue={customAmounts[message.id] || extractAmount(`${message.subject} ${message.snippet}`)}
                              onChange={(e) => setCustomAmounts(prev => ({
                                ...prev,
                                [message.id]: parseFloat(e.target.value) || 0
                              }))}
                              onBlur={() => setEditingAmount(null)}
                              autoFocus
                            />
                          ) : (
                            <button 
                              onClick={() => setEditingAmount(message.id)}
                              className="text-xs font-medium text-green-600 hover:underline flex items-center gap-1"
                            >
                              R$ {(customAmounts[message.id] || extractAmount(`${message.subject} ${message.snippet}`)).toFixed(2)}
                              <Edit2 className="h-2.5 w-2.5" />
                            </button>
                          )}
                        </div>
                        
                        {/* Categoria detectada */}
                        <Badge variant="secondary" className="text-xs">
                          {detectCategory(message.from, message.subject)}
                        </Badge>
                        
                        {/* Data */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(message.date).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleImport(message)}
                      disabled={importing === message.id}
                      size="sm"
                      className="shrink-0"
                    >
                      {importing === message.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('gmail.importing')}
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          {t('gmail.import')}
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status da integração */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-muted-foreground">
              {t('gmail.connectedReady')}
            </span>
          </div>
          
          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>{t('gmail.howItWorks')}</strong> {t('gmail.howItWorksDesc')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
