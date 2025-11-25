import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Upload, FileText, Image as ImageIcon, Trash2, Download, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { FinanceBlockProps } from '@/types/finance-blocks'
import { useI18n } from '@/hooks/use-i18n'

interface Receipt {
  id: string
  user_id: string
  finance_document_id: string
  task_id: string | null // ✨ Vinculação com task
  file_name: string
  file_type: string
  file_size: number
  storage_path: string
  description: string | null
  transaction_id: string | null
  created_at: string
  updated_at: string
  publicUrl?: string // URL pública temporária
}

/**
 * Bloco de comprovantes
 * Upload e gerenciamento de comprovantes usando Supabase Storage
 */
export const ReceiptsBlock = ({
  documentId,
}: FinanceBlockProps) => {
  const { t } = useI18n()
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [tasks, setTasks] = useState<any[]>([]) // ✨ Lista de tasks disponíveis
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchReceipts()
  }, [documentId])

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

  const fetchReceipts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('finance_receipts')
        .select('*')
        .eq('finance_document_id', documentId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Gerar URLs públicas temporárias para cada arquivo
      const receiptsWithUrls = await Promise.all(
        (data || []).map(async (receipt) => {
          const { data: urlData } = await supabase.storage
            .from('finance-receipts')
            .createSignedUrl(receipt.storage_path, 3600) // 1 hora

          return {
            ...receipt,
            publicUrl: urlData?.signedUrl || '',
          }
        })
      )

      setReceipts(receiptsWithUrls)
    } catch (err: any) {
      console.error('Error loading receipts:', err)
      toast.error(t('finance.receipts.errorLoad'), {
        description: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error(t('finance.goals.userNotAuthenticated'))
        return
      }

      for (const file of Array.from(files)) {
        // Validar tipo
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
        if (!validTypes.includes(file.type)) {
          toast.error(`${file.name} ${t('finance.receipts.fileNotSupported')}`)
          continue
        }

        // Validar tamanho (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} ${t('finance.receipts.fileTooLarge')}`)
          continue
        }

        // Gerar caminho único no storage
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(7)
        const fileExt = file.name.split('.').pop()
        const storagePath = `${user.id}/${documentId}/${timestamp}-${randomStr}.${fileExt}`

        // Upload para o storage
        const { error: uploadError } = await supabase.storage
          .from('finance-receipts')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          toast.error(`${t('finance.receipts.uploadError')} ${file.name}`, {
            description: uploadError.message,
          })
          continue
        }

        // Salvar metadados no banco
        const { error: dbError } = await supabase
          .from('finance_receipts')
          .insert({
            user_id: user.id,
            finance_document_id: documentId,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            storage_path: storagePath,
          })

        if (dbError) {
          // Se falhar ao salvar metadados, deletar arquivo do storage
          await supabase.storage
            .from('finance-receipts')
            .remove([storagePath])

          toast.error(`${t('finance.receipts.saveError')} ${file.name}`, {
            description: dbError.message,
          })
          continue
        }
      }

      // Recarregar lista
      await fetchReceipts()
      toast.success(t('finance.receipts.fileUploaded'))
    } catch (err: any) {
      toast.error(t('finance.table.errorAdd'), {
        description: err.message,
      })
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  const handleDelete = async (receipt: Receipt) => {
    if (!confirm(`${t('finance.receipts.confirmDelete')} ${receipt.file_name}?`)) return

    try {
      // Deletar do storage
      const { error: storageError } = await supabase.storage
        .from('finance-receipts')
        .remove([receipt.storage_path])

      if (storageError) throw storageError

      // Deletar do banco
      const { error: dbError } = await supabase
        .from('finance_receipts')
        .delete()
        .eq('id', receipt.id)

      if (dbError) throw dbError

      // Atualizar lista local
      setReceipts(receipts.filter(r => r.id !== receipt.id))
      toast.success(t('finance.receipts.receiptRemoved'))
    } catch (err: any) {
      toast.error(t('finance.budget.errorDelete'), {
        description: err.message,
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-lg" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
              <Skeleton className="h-12 w-12 rounded flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-8 w-8 rounded flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
        <input
          type="file"
          id="receipt-upload"
          className="hidden"
          accept="image/*,.pdf"
          multiple
          onChange={handleFileUpload}
          disabled={uploading}
        />
        <label
          htmlFor="receipt-upload"
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              {uploading ? t('finance.receipts.uploading') : t('finance.receipts.clickToUpload')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('finance.receipts.supportedFormats')}
            </p>
          </div>
        </label>
      </div>

      {/* Lista de comprovantes */}
      {receipts.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm text-muted-foreground">
            {t('finance.receipts.noReceipts')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('finance.receipts.uploadInvoices')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {receipts.map((receipt) => (
            <div
              key={receipt.id}
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              {/* Preview/Ícone */}
              {receipt.file_type.startsWith('image/') && receipt.publicUrl ? (
                <img
                  src={receipt.publicUrl}
                  alt={receipt.file_name}
                  className="w-12 h-12 object-cover rounded border"
                />
              ) : (
                <div className="w-12 h-12 flex items-center justify-center rounded bg-muted border">
                  {getFileIcon(receipt.file_type)}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{receipt.file_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {formatFileSize(receipt.file_size)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(receipt.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-1">
                {receipt.publicUrl && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(receipt.publicUrl, '_blank')}
                      className="h-8 w-8"
                      title={t('finance.receipts.view')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const a = document.createElement('a')
                        a.href = receipt.publicUrl!
                        a.download = receipt.file_name
                        a.click()
                      }}
                      className="h-8 w-8"
                      title={t('finance.receipts.download')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(receipt)}
                  className="h-8 w-8 hover:text-destructive"
                  title={t('finance.receipts.delete')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resumo */}
      {receipts.length > 0 && (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30 text-sm">
          <span className="text-muted-foreground">{t('finance.receipts.totalFiles')}</span>
          <span className="font-semibold">{receipts.length}</span>
        </div>
      )}
    </div>
  )
}
