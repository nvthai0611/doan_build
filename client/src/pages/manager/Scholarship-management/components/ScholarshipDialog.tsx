'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

interface ScholarshipDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    name: string
    description: string | null
    percent: number
    criteria: any | null
    isActive: boolean
  }) => Promise<void>
  initialData?: {
    name: string
    description: string | null
    percent: number
    criteria: any | null
    isActive: boolean
  }
  title: string
  description: string
  isSubmitting?: boolean
}

export function ScholarshipDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title,
  description,
  isSubmitting = false,
}: ScholarshipDialogProps) {
  const [name, setName] = useState('')
  const [scholarshipDescription, setScholarshipDescription] = useState('')
  const [percent, setPercent] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setScholarshipDescription(initialData.description || '')
      setPercent(initialData.percent.toString())
      setIsActive(initialData.isActive)
    } else {
      setName('')
      setScholarshipDescription('')
      setPercent('')
      setIsActive(true)
    }
    // Reset errors when dialog opens/closes
    setErrors({})
  }, [initialData, open])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate name
    const trimmedName = name.trim()
    if (!trimmedName) {
      newErrors.name = 'Tên học bổng không được để trống'
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Tên học bổng phải có ít nhất 2 ký tự'
    } else if (trimmedName.length > 100) {
      newErrors.name = 'Tên học bổng không được vượt quá 100 ký tự'
    }

    // Validate percent
    if (!percent.trim()) {
      newErrors.percent = 'Phần trăm giảm giá không được để trống'
    } else {
      const percentValue = Number.parseFloat(percent)
      if (isNaN(percentValue)) {
        newErrors.percent = 'Phần trăm giảm giá phải là số'
      } else if (percentValue < 0) {
        newErrors.percent = 'Phần trăm giảm giá không được nhỏ hơn 0'
      } else if (percentValue > 100) {
        newErrors.percent = 'Phần trăm giảm giá không được lớn hơn 100'
      }
    }

    // Validate description (optional but if provided, check length)
    if (scholarshipDescription.trim() && scholarshipDescription.trim().length > 500) {
      newErrors.description = 'Mô tả không được vượt quá 500 ký tự'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const percentValue = Number.parseFloat(percent)

    await onSubmit({
      name: name.trim(),
      description: scholarshipDescription.trim() || null,
      percent: percentValue,
      criteria: null, // Có thể mở rộng sau
      isActive,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Scholarship Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Tên học bổng <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Học bổng xuất sắc"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: '' }))
                }
              }}
              disabled={isSubmitting}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Mô tả..."
              value={scholarshipDescription}
              onChange={(e) => {
                setScholarshipDescription(e.target.value)
                if (errors.description) {
                  setErrors((prev) => ({ ...prev, description: '' }))
                }
              }}
              disabled={isSubmitting}
              rows={3}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Percent */}
          <div className="space-y-2">
            <Label htmlFor="percent">
              Phần trăm giảm giá (%) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="percent"
              type="number"
              placeholder="20"
              step="0.01"
              value={percent}
              onChange={(e) => {
                setPercent(e.target.value)
                if (errors.percent) {
                  setErrors((prev) => ({ ...prev, percent: '' }))
                }
              }}
              disabled={isSubmitting}
              className={errors.percent ? 'border-destructive' : ''}
            />
            {errors.percent && (
              <p className="text-sm text-destructive">{errors.percent}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between">
            <Label htmlFor="isActive" className="cursor-pointer">
              Trạng thái
            </Label>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked)}
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Đang xử lý...' : 'Lưu'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

