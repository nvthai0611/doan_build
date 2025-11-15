export interface TeacherFeedbackItem {
  id: string
  teacherId: string
  teacherName: string
  teacherAvatar?: string
  parentName: string
  parentEmail: string
  studentName: string
  classId: string
  className: string
  rating: number
  categories: any
  comment: string
  isAnonymous: boolean
  status: 'pending' | 'approved' | 'rejected' | 'archived' | string
  createdAt: string
}

export interface TeacherFeedbackQuery {
  search?: string
  teacherId?: string
  classId?: string
  rating?: number
  isAnonymous?: boolean
  dateFrom?: string
  dateTo?: string
  status?: string
}

export interface ApiResponse<T> {
  data: T
  message: string
}

export interface ClassAIAnalysis {
  classId: string
  className: string
  sentiment: 'positive' | 'negative' | 'neutral'
  sentimentExplanation: string
  overallAnalysis: string
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  keyInsights: string[]
  feedbackCount: number
  avgRating: number
  analyzedAt: string
}

