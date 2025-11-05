export interface Room {
  id: string
  name: string
  capacity: number | null
  equipment: string[] | null
  isActive: boolean
  createdAt: string | Date
}

export interface CreateRoomDto {
  name: string
  capacity?: number | null
  equipment?: string[] | null
  isActive?: boolean
}

export interface UpdateRoomDto {
  name?: string
  capacity?: number | null
  equipment?: string[] | null
  isActive?: boolean
}

export interface RoomsResponse {
  success: boolean
  message: string
  data: Room[]
}

export interface RoomResponse {
  success: boolean
  message: string
  data: Room
}

