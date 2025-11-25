import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useTaskDriveAttachments } from '@/hooks/use-task-drive-attachments'
import { DrivePickerDialog } from '@/components/drive/drive-picker-dialog'
import { cn } from '@/lib/utils'
import {
  Paperclip,
  FileText,
  Image,
  Video,
  File,
  ExternalLink,
  X,
  Loader2
} from 'lucide-react'

interface TaskDriveAttachmentsProps {
  taskId: string
}

export function TaskDriveAttachments({ taskId }: TaskDriveAttachmentsProps) {
  const [showPicker, setShowPicker] = useState(false)
  const { attachments, loading, attaching, attachFiles, removeAttachment, openInDrive } = useTaskDriveAttachments({ taskId })

  // Ícone por tipo de arquivo
  const getFileIcon = (mimeType: string | null) => {
    if (!mimeType) return <File className="h-4 w-4 text-muted-foreground" />
    
    if (mimeType.startsWith('image/')) {
      return <Image className="h-4 w-4 text-green-500" />
    }
    if (mimeType.startsWith('video/')) {
      return <Video className="h-4 w-4 text-purple-500" />
    }
    if (mimeType.includes('document') || mimeType.includes('text')) {
      return <FileText className="h-4 w-4 text-blue-500" />
    }
    return <File className="h-4 w-4 text-muted-foreground" />
  }

  // Formatar tamanho
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return ''
    const kb = bytes / 1024
    const mb = kb / 1024
    if (mb >= 1) return `${mb.toFixed(1)} MB`
    if (kb >= 1) return `${kb.toFixed(0)} KB`
    return `${bytes} B`
  }

  return (
    <div className="space-y-4">
      {/* Header com botão */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold">Anexos do Drive</h4>
          {attachments.length > 0 && (
            <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded-md bg-muted">
              {attachments.length}
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPicker(true)}
          disabled={attaching}
          className="h-8 text-xs"
        >
          {attaching ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Anexando...
            </>
          ) : (
            <>
              <Paperclip className="mr-1.5 h-3.5 w-3.5" />
              Anexar Arquivo
            </>
          )}
        </Button>
      </div>

      {/* Lista de anexos */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : attachments.length === 0 ? (
        <div className="text-center py-8 rounded-lg border border-dashed border-border/50">
          <Paperclip className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-30" />
          <p className="text-sm text-muted-foreground">
            Nenhum anexo do Drive
          </p>
        </div>
      ) : (
        <div className="space-y-0.5 rounded-lg border border-border/50">
          {attachments.map((attachment, index) => (
            <motion.div
              key={attachment.id}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ delay: index * 0.03 }}
              className={cn(
                "flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors group",
                index !== attachments.length - 1 && "border-b border-border/30"
              )}
            >
              {/* Ícone */}
              <div className="flex-shrink-0">
                {getFileIcon(attachment.drive_file_type)}
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {attachment.drive_file_name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {attachment.drive_file_size && (
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(attachment.drive_file_size)}
                    </span>
                  )}
                </div>
              </div>

              {/* Ações (aparecem no hover) */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openInDrive(attachment.drive_file_id)}
                  className="h-7 w-7"
                  title="Abrir no Drive"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAttachment(attachment.id)}
                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                  title="Remover anexo"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Picker Dialog */}
      <DrivePickerDialog
        open={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={attachFiles}
        multiple={true}
      />
    </div>
  )
}
