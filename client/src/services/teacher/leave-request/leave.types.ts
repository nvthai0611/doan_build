export interface AffectedSessionItem {
  id: string
  date: string
  time: string
  className: string
  room: string
  selected: boolean
  replacementTeacherId?: string
}

export interface AffectedSessionsParams {
  startDate: string
  endDate: string
}

export interface ReplacementTeacher {
  id: string
  fullName: string
  email: string
  phone?: string
  subjects: string[]
  compatibilityScore: number
  compatibilityReason: string
  isAvailable: boolean
  availabilityNote?: string
}

export interface ReplacementTeachersParams {
  sessionId: string
  date: string
  time: string
}

