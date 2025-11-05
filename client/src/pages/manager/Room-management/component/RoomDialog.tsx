"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

const PRESET_EQUIPMENT = [
  "Máy chiếu",
  "Bảng trắng",
  "Bảng đen",
  "Microphone",
  "Loa",
  "Màn hình LCD",
  "Máy tính",
  "Ghế ngồi",
  "Bàn làm việc",
  "Điều hòa",
  "Quạt",
  "Đèn LED",
]

interface RoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    name: string
    capacity: number | null
    equipment: string[] | null
    isActive: boolean
  }) => Promise<void>
  initialData?: {
    name: string
    capacity: number | null
    equipment: string[] | null
    isActive: boolean
  }
  title: string
  description: string
  isSubmitting?: boolean
}

export function RoomDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title,
  description,
  isSubmitting = false,
}: RoomDialogProps) {
  const [name, setName] = useState("")
  const [capacity, setCapacity] = useState("")
  const [equipment, setEquipment] = useState<string[]>([])
  const [equipmentInput, setEquipmentInput] = useState("")
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setCapacity(initialData.capacity?.toString() || "")
      setEquipment(initialData.equipment || [])
      setIsActive(initialData.isActive)
    } else {
      setName("")
      setCapacity("")
      setEquipment([])
      setIsActive(true)
    }
    setEquipmentInput("")
  }, [initialData, open])

  const togglePresetEquipment = (item: string) => {
    if (equipment.includes(item)) {
      setEquipment(equipment.filter((e) => e !== item))
    } else {
      setEquipment([...equipment, item])
    }
  }

  const handleAddEquipment = () => {
    if (equipmentInput.trim() && !equipment.includes(equipmentInput.trim())) {
      setEquipment([...equipment, equipmentInput.trim()])
      setEquipmentInput("")
    }
  }

  const handleRemoveEquipment = (item: string) => {
    setEquipment(equipment.filter((e) => e !== item))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert("Tên phòng không được để trống")
      return
    }

    await onSubmit({
      name: name.trim(),
      capacity: capacity ? Number.parseInt(capacity) : null,
      equipment: equipment.length > 0 ? equipment : null,
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
          {/* Room Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên phòng *</Label>
            <Input
              id="name"
              placeholder="VD: Phòng A1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <Label htmlFor="capacity">Sĩ số tối đa</Label>
            <Input
              id="capacity"
              type="number"
              placeholder="VD: 30"
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label>Thiết bị (Chọn nhanh)</Label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_EQUIPMENT.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => togglePresetEquipment(item)}
                  disabled={isSubmitting}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    equipment.includes(item)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  } disabled:opacity-50`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Thiết bị khác</Label>
            <div className="flex gap-2">
              <Input
                placeholder="VD: Thiết bị khác"
                value={equipmentInput}
                onChange={(e) => setEquipmentInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddEquipment()
                  }
                }}
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddEquipment}
                disabled={isSubmitting || !equipmentInput.trim()}
              >
                Thêm
              </Button>
            </div>
            {equipment.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {equipment.map((item) => (
                  <Badge key={item} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemoveEquipment(item)}
                      className="ml-1 hover:text-destructive"
                      disabled={isSubmitting}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked as boolean)}
              disabled={isSubmitting}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Phòng hoạt động
            </Label>
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
