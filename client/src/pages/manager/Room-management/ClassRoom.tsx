"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRooms, Room } from "../../../hooks/use-rooms"
import { RoomDialog } from "./components/RoomDialog"
import { RoomsList } from "./components/RoomsList"

export default function ClassroomsPage() {
  const { rooms, addRoom, updateRoom, deleteRoom, isSubmitting } = useRooms()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<Room> | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleAddClick = () => {
    setEditingId(null)
    setEditingData(null)
    setDialogOpen(true)
  }

  const handleEditClick = (room: Room) => {
    setEditingId(room.id)
    setEditingData(room)
    setDialogOpen(true)
  }

  const handleDialogSubmit = async (data: {
    name: string
    capacity: number | null
    equipment: string[] | null
    isActive: boolean
  }) => {
    try {
      if (editingId) {
        await updateRoom(editingId, data)
      } else {
        await addRoom(data)
      }
      setDialogOpen(false)
    } catch (error) {
      console.error("Error submitting room:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Bạn chắc chắn muốn xóa phòng này?")) {
      setDeletingId(id)
      try {
        await deleteRoom(id)
      } finally {
        setDeletingId(null)
      }
    }
  }

  // Đảm bảo rooms luôn là mảng
  const roomsArray = Array.isArray(rooms) ? rooms : []
  
  const totalCapacity = roomsArray.reduce((sum: number, room: Room) => sum + (room.capacity || 0), 0)
  const activeRooms = roomsArray.filter((r: Room) => r.isActive).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý phòng học</h1>
          <p className="text-muted-foreground mt-1">Quản lý sĩ số tối đa, thiết bị và trạng thái phòng</p>
        </div>
        <Button onClick={handleAddClick}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm phòng
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tổng phòng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roomsArray.length}</div>
            <p className="text-xs text-muted-foreground">Phòng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Phòng hoạt động</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRooms}</div>
            <p className="text-xs text-muted-foreground">Phòng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sĩ số tối đa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacity}</div>
            <p className="text-xs text-muted-foreground">Học viên</p>
          </CardContent>
        </Card>
      </div>

      {/* Rooms List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Danh sách phòng học</h2>
        <RoomsList rooms={roomsArray} onEdit={handleEditClick} onDelete={handleDelete} isDeleting={deletingId} />
      </div>

      {/* Dialog */}
      <RoomDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleDialogSubmit}
        initialData={
          editingData
            ? {
                name: editingData.name || "",
                capacity: editingData.capacity || null,
                equipment: editingData.equipment || null,
                isActive: editingData.isActive !== false,
              }
            : undefined
        }
        title={editingId ? "Cập nhật phòng" : "Thêm phòng mới"}
        description={editingId ? "Chỉnh sửa thông tin phòng" : "Nhập thông tin phòng mới"}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
