export interface UpcomingLesson {
  className: string
  subject: string
  time: string
  room: string
  teacher: string
  status: string
  attendanceStatus: string
  studentName: string
}

export interface ActiveClass {
  id: string
  name: string
  subject: string
  teacher: string
  progress: number
  schedule: string
  room: string
  nextClass: string
  studentName: string
}

export interface ParentOverviewData {
  parentName: string
  gender: 'male' | 'female' | null
  upcomingLessons: UpcomingLesson[]
  activeClasses: ActiveClass[]
  studentCount: number
}

export interface ParentOverviewResponse {
  success: boolean
  data: ParentOverviewData
  message: string
}
