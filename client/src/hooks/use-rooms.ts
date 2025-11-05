"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { classroomService } from "@/services/center-owner/class-rooms/classroom.service"
import type { Room, CreateRoomDto, UpdateRoomDto } from "@/services/center-owner/class-rooms/classroom.types"

// Re-export Room type để các component khác có thể dùng
export type { Room }

export function useRooms() {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: roomsResponse, isLoading, error } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      return await classroomService.getRooms()
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

  // Đảm bảo rooms luôn là mảng, ngay cả khi undefined hoặc không phải mảng
  const rooms: Room[] = Array.isArray(roomsResponse) ? roomsResponse : []

  const addRoom = async (roomData: CreateRoomDto) => {
    setIsSubmitting(true)
    try {
      const newRoom = await classroomService.createRoom(roomData)
      await queryClient.invalidateQueries({ queryKey: ['rooms'] })
      return newRoom
    } catch (error) {
      console.error("Error adding room:", error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateRoom = async (id: string, roomData: UpdateRoomDto) => {
    setIsSubmitting(true)
    try {
      const updatedRoom = await classroomService.updateRoom(id, roomData)
      await queryClient.invalidateQueries({ queryKey: ['rooms'] })
      return updatedRoom
    } catch (error) {
      console.error("Error updating room:", error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteRoom = async (id: string) => {
    setIsSubmitting(true)
    try {
      await classroomService.deleteRoom(id)
      await queryClient.invalidateQueries({ queryKey: ['rooms'] })
    } catch (error) {
      console.error("Error deleting room:", error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    rooms,
    addRoom,
    updateRoom,
    deleteRoom,
    isLoading,
    isSubmitting,
    error,
  }
}
