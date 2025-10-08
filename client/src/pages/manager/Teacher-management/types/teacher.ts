export interface Teacher {
    id: string
    name: string
    email: string
    phone: string
    username: string
    code: string
    role: "Giáo viên" | "Chủ trung tâm"
    gender: "MALE" | "FEMALE" | "OTHER"
    birthDate?: string
    status: boolean
    verifiedPhone?: string
    verifiedEmail?: string
    loginUsername?: string
    accountStatus?: boolean
    notes?: string
    contractEnd?: string
    subjects?: string[]
    salary?: number
  }
  
  export interface Tab {
    key: string
    label: string
    count: number
  }
  
  export interface FilterState {
    birthDate?: string
    birthMonth?: string
    birthYear?: string
    gender?: string
  }
  