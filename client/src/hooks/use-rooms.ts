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
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })

  // Đảm bảo rooms luôn là mảng, ngay cả khi undefined hoặc không phải mảng
  const rooms: Room[] = Array.isArray(roomsResponse) ? roomsResponse : []

  const addRoom = async (roomData: CreateRoomDto) => {
    setIsSubmitting(true)
    try {
      const newRoom = await classroomService.createRoom(roomData)
      queryClient.setQueryData(['rooms'], (old: Room[] | undefined) => {
        const oldRooms = Array.isArray(old) ? old : []
        return [...oldRooms, newRoom]
      })
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
      queryClient.setQueryData(['rooms'], (old: Room[] | undefined) => {
        const oldRooms = Array.isArray(old) ? old : []
        return oldRooms.map((r: Room) => (r.id === id ? updatedRoom : r))
      })
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
      queryClient.setQueryData(['rooms'], (old: Room[] | undefined) => {
        const oldRooms = Array.isArray(old) ? old : []
        return oldRooms.filter((r: Room) => r.id !== id)
      })
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
