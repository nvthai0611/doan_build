import { apiClient } from '../../../utils/clientAxios'
import type { Room, CreateRoomDto, UpdateRoomDto, RoomsResponse, RoomResponse } from './classroom.types'

const BASE_URL = '/admin-center/rooms'

export const classroomService = {
  /**
   * Lấy danh sách tất cả phòng học
   */
  getRooms: async (): Promise<Room[]> => {
    const response = await apiClient.get<RoomsResponse>(BASE_URL)
    return (response.data?.data || response.data || []) as Room[]
  },

  /**
   * Lấy thông tin một phòng học theo ID
   */
  getRoomById: async (id: string): Promise<Room> => {
    const response = await apiClient.get<RoomResponse>(`${BASE_URL}/${id}`)
    return (response.data?.data || response.data) as Room
  },

  /**
   * Tạo phòng học mới
   */
  createRoom: async (data: CreateRoomDto): Promise<Room> => {
    const response = await apiClient.post<RoomResponse>(BASE_URL, data)
    return (response.data?.data || response.data) as Room
  },

  /**
   * Cập nhật thông tin phòng học
   */
  updateRoom: async (id: string, data: UpdateRoomDto): Promise<Room> => {
    const response = await apiClient.put<RoomResponse>(`${BASE_URL}/${id}`, data)
    return (response.data?.data || response.data) as Room
  },

  /**
   * Xóa phòng học
   */
  deleteRoom: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`)
  },
}

