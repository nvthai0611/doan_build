import { toast as sonnerToast } from 'sonner'

type ToastVariant = 'default' | 'destructive'

interface ToastInput {
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

export function useToast() {
  const toast = (input: ToastInput) => {
    const message = input.title ?? (input.variant === 'destructive' ? 'Lỗi' : 'Thông báo')
    const options: Record<string, any> = {}

    if (input.description) {
      options.description = input.description
    }

    if (typeof input.duration === 'number') {
      options.duration = input.duration
    }

    if (input.variant === 'destructive') {
      sonnerToast.error(message, options)
    } else {
      sonnerToast(message, options)
    }
  }

  return { toast }
}


