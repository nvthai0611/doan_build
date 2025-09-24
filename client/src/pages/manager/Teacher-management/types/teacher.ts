export interface Employee {
    id: number
    name: string
    email: string
    phone: string
    username: string
    code: string
    role: "Giáo viên" | "Giáo vụ" | "Chủ trung tâm"
    gender: "Nam" | "Nữ"
    birthDate?: string
    status: boolean
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
  }
  