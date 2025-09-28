import { ApiService } from "../../common/api/api-client"
import type { Message, MessageAttachment, CreateMessageRequest, MessageQueryParams, Notification, Announcement } from "./communication.types"

export const parentCommunicationService = {
  // ===== Messages =====
  
  getMessages: async (params?: MessageQueryParams): Promise<Message[]> => {
    const response = await ApiService.get<Message[]>("/parent/communication/messages", params)
    return response.data
  },

  getMessageById: async (messageId: string): Promise<Message> => {
    const response = await ApiService.get<Message>(`/parent/communication/messages/${messageId}`)
    return response.data
  },

  sendMessage: async (data: CreateMessageRequest): Promise<Message> => {
    const response = await ApiService.post<Message>("/parent/communication/messages", data)
    return response.data
  },

  markMessageAsRead: async (messageId: string): Promise<void> => {
    await ApiService.patch(`/parent/communication/messages/${messageId}/read`)
  },

  deleteMessage: async (messageId: string): Promise<void> => {
    await ApiService.delete(`/parent/communication/messages/${messageId}`)
  },

  // ===== Notifications =====
  
  getNotifications: async (unreadOnly?: boolean): Promise<Notification[]> => {
    const params = unreadOnly ? { unreadOnly: true } : {}
    const response = await ApiService.get<Notification[]>("/parent/communication/notifications", params)
    return response.data
  },

  markNotificationAsRead: async (notificationId: string): Promise<void> => {
    await ApiService.patch(`/parent/communication/notifications/${notificationId}/read`)
  },

  markAllNotificationsAsRead: async (): Promise<void> => {
    await ApiService.patch("/parent/communication/notifications/mark-all-read")
  },

  // ===== Announcements =====
  
  getAnnouncements: async (): Promise<Announcement[]> => {
    const response = await ApiService.get<Announcement[]>("/parent/communication/announcements")
    return response.data
  },

  getAnnouncementById: async (announcementId: string): Promise<Announcement> => {
    const response = await ApiService.get<Announcement>(`/parent/communication/announcements/${announcementId}`)
    return response.data
  }
}
