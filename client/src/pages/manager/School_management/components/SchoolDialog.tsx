"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface SchoolDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    name: string
    address?: string
    phone?: string
  }) => Promise<void>
  initialData?: {
    name: string
    address?: string
    phone?: string
  }
  title: string
  description: string
  isSubmitting?: boolean
}

export function SchoolDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title,
  description,
  isSubmitting = false,
}: SchoolDialogProps) {
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setAddress(initialData.address || "")
      setPhone(initialData.phone || "")
    } else {
      setName("")
      setAddress("")
      setPhone("")
    }
  }, [initialData, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      alert("Tên trường học không được để trống")
      return
    }

    await onSubmit({
      name: name.trim(),
      address: address.trim() || undefined,
      phone: phone.trim() || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên trường */}
          <div>
            <Label htmlFor="name">
              Tên trường học <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Trường THPT Nguyễn Huệ"
              className="mt-1.5"
              required
            />
          </div>

          {/* Địa chỉ */}
          <div>
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="VD: 123 Đường ABC, Quận XYZ, TP.HCM"
              className="mt-1.5"
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="VD: 0901234567"
              className="mt-1.5"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang xử lý..." : initialData ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
