
export interface Class {
    id: number
    name: string
    subject: string
    students: number
    schedule: string
    status: 'active' | 'completed' | 'pending'
    startDate: string
    endDate: string
    room: string
    description: string
    teacherId?: string
  }
  
  export interface ClassStats {
    totalClasses: number
    totalStudents: number
    activeClasses: number
    completedClasses: number
    pendingClasses: number
  }
  
  export interface GetClassesParams {
    teacherId: string
    status?: string
    search?: string
    page?: number
    limit?: number
  }
  
  export interface GetClassesResponse {
    classes: Class[]
    stats: ClassStats
    total: number
    page: number
    limit: number
    totalPages: number
  } 

