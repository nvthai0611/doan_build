"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Users, Package } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Room } from "../../../../hooks/use-rooms"

interface RoomsListProps {
  rooms: Room[]
  onEdit: (room: Room) => void
  onDelete: (id: string) => Promise<void>
  isDeleting?: string | null
}

export function RoomsList({ rooms, onEdit, onDelete, isDeleting }: RoomsListProps) {
  if (rooms.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Chưa có phòng học nào</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rooms.map((room) => (
        <Card key={room.id} className={!room.isActive ? "opacity-60" : ""}>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{room.name}</h3>
              <p className="text-xs text-muted-foreground">
                {format(new Date(room.createdAt), "dd/MM/yyyy", { locale: vi })}
              </p>
            </div>
            <Badge variant={room.isActive ? "default" : "secondary"}>
              {room.isActive ? "Hoạt động" : "Không hoạt động"}
            </Badge>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Capacity */}
            {room.capacity && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  Sĩ số tối đa: <strong>{room.capacity}</strong>
                </span>
              </div>
            )}

            {/* Equipment */}
            {room.equipment && room.equipment.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Thiết bị:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {room.equipment.map((item) => (
                    <Badge key={item} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => onEdit(room)}>
                <Edit className="w-4 h-4 mr-2" />
                Sửa
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-destructive hover:text-destructive bg-transparent"
                onClick={() => onDelete(room.id)}
                disabled={isDeleting === room.id}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
