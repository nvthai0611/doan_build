"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface SubjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { code: string; name: string; description?: string }) => Promise<void>
  initialData?: {
    code: string
    name: string
    description?: string
  }
  title: string
  description: string
  isSubmitting?: boolean
}

export function SubjectDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title,
  description,
  isSubmitting = false,
}: SubjectDialogProps) {
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [subjectDescription, setSubjectDescription] = useState("")

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code)
      setName(initialData.name)
      setSubjectDescription(initialData.description || "")
    } else {
      setCode("")
      setName("")
      setSubjectDescription("")
    }
  }, [initialData, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!code.trim() || !name.trim()) {
      alert("Mã môn học và tên môn học không được để trống")
      return
    }

    await onSubmit({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: subjectDescription.trim() || undefined,
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
          {/* Subject Code */}
          <div className="space-y-2">
            <Label htmlFor="code">Mã môn học *</Label>
            <Input
              id="code"
              placeholder="VD: MATH"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isSubmitting}
              maxLength={20}
            />
          </div>

          {/* Subject Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên môn học *</Label>
            <Input
              id="name"
              placeholder="VD: Toán học"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Mô tả chi tiết về môn học..."
              value={subjectDescription}
              onChange={(e) => setSubjectDescription(e.target.value)}
              disabled={isSubmitting}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Đang xử lý..." : "Lưu"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
