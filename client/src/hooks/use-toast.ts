import { toast as sonnerToast } from 'sonner'

type ToastVariant = 'default' | 'destructive'

interface ToastInput {
  title?: string
  description?: string
  variant?: ToastVariant
}

export function useToast() {
  const toast = (input: ToastInput) => {
    const message = input.title ?? (input.variant === 'destructive' ? 'Lỗi' : 'Thông báo')
    const options = input.description ? { description: input.description } : undefined

    if (input.variant === 'destructive') {
      sonnerToast.error(message, options)
    } else {
      sonnerToast(message, options)
    }
  }

  return { toast }
}


