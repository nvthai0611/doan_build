export interface Student {
    id: number
    name: string
    email: string
    phone: string
    username: string
    code: string
    status: "Đang học" | "Chờ xếp lớp" | "Dừng học" | "Chưa cập nhật lịch học" | "Sắp học" | "Bảo lưu" | "Tốt nghiệp"
    course: string
    class: string
    averageScore: number
    totalFee: number
    walletBalance: number
    gender: string
    birthDate?: string
    avatar?: string
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
    course?: string
    class?: string
    gender?: string
    accountStatus?: string
    customerConnection?: string
  }
  