// ===== Parent Teacher Feedback Types =====

export interface TeacherClassRef {
  id: string
  name: string
}

export interface AvailableTeacher {
  id: string
  name: string
  avatar?: string | null
  classes: TeacherClassRef[]
}

export interface CreateTeacherFeedbackDto {
  teacherId: string
  classId?: string
  rating: number
  comment?: string
  categories?: {
    teaching_quality?: number
    communication?: number
    punctuality?: number
    professionalism?: number
  }
  isAnonymous?: boolean
}

export interface TeacherFeedbackItem {
  id: string
  teacherId: string
  classId?: string
  rating: number
  comment: string
  categories?: any
  isAnonymous: boolean
  date: string
  status: 'pending' | 'approved' | 'rejected' | 'archived'
  teacherName?: string
  className?: string
}
