import type { User } from "../../common/types/shared.types"

export interface Message {
  id: string
  senderId: string
  receiverId: string
  subject: string
  body: string
  isRead: boolean
  readAt?: string
  createdAt: string
  sender: User
  receiver: User
  attachments?: MessageAttachment[]
}

export interface MessageAttachment {
  id: string
  filename: string
  fileUrl: string
  fileSize: number
  fileType: string
}

export interface CreateMessageRequest {
  receiverId: string
  subject: string
  body: string
  attachments?: File[]
}

export interface MessageQueryParams {
  search?: string
  isRead?: boolean
  senderId?: string
  receiverId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  isRead: boolean
  createdAt: string
  actionUrl?: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  priority: "low" | "medium" | "high"
  isPublished: boolean
  publishedAt?: string
  expiresAt?: string
  createdAt: string
  author: User
  attachments?: MessageAttachment[]
}
