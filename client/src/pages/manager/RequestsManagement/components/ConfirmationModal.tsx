import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText: string
  cancelText?: string
  type: 'approve' | 'reject' | 'delete'
  isLoading?: boolean
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText = 'Hủy',
  type,
  isLoading = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'approve':
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case 'reject':
        return <XCircle className="w-6 h-6 text-red-600" />
      case 'delete':
        return <AlertTriangle className="w-6 h-6 text-orange-600" />
      default:
        return <AlertTriangle className="w-6 h-6 text-orange-600" />
    }
  }

  const getConfirmButtonVariant = () => {
    switch (type) {
      case 'approve':
        return 'default'
      case 'reject':
        return 'destructive'
      case 'delete':
        return 'destructive'
      default:
        return 'default'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {message}
          </p>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button 
              variant={getConfirmButtonVariant()}
              onClick={() => {
                onConfirm()
              }}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmationModal
