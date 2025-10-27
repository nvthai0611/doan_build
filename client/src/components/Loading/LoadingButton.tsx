import React from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LoadingButtonProps {
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  type?: 'button' | 'submit' | 'reset'
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  loadingText?: string
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  disabled = false,
  children,
  onClick,
  type = 'button',
  variant = 'default',
  size = 'default',
  className,
  loadingText
}) => {
  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn('relative', className)}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {loading && loadingText ? loadingText : children}
    </Button>
  )
}

// ============== Cách sử dụng ==============
// // Cơ bản
// <LoadingButton loading={isLoading}>
//   Lưu
// </LoadingButton>

// // Với loading text
// <LoadingButton 
//   loading={isSubmitting} 
//   loadingText="Đang xử lý..."
// >
//   Xác nhận thanh toán
// </LoadingButton>

// // Với variant và size
// <LoadingButton
//   loading={isDeleting}
//   variant="destructive"
//   size="sm"
//   onClick={handleDelete}
// >
//   Xóa
// </LoadingButton>

// // Submit form
// <LoadingButton
//   type="submit"
//   loading={isLoading}
//   disabled={!isValid}
//   className="w-full"
// >
//   Đăng nhập
// </LoadingButton>

// // Với icon custom
// <LoadingButton loading={isSaving}>
//   <Save className="mr-2 h-4 w-4" />
//   Lưu thay đổi
// </LoadingButton>