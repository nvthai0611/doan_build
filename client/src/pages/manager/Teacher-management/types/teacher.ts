export interface Teacher {
    id: string
    name: string
    email: string
    phone: string
    username: string
    code: string
    role: "teacher" | "admin" | "center_owner"
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
    schoolName?: string
    schoolAddress?: string
    // New fields from updated schema
    school?: {
      id: string
      name: string
      address?: string
      phone?: string
    }
    contractUploads?: Array<{
      id: string
      uploadedImageUrl: string
      uploadedImageName?: string
      uploadedAt: string
      contractType: string
    }>
    classes?: {
      id: string
      name: string
      subject: {
        id: string
        name: string
      }
      grade: {
        id: string
        name: string
        level: number
      }
    }[]
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
  