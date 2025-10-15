import { ApiService } from "../../common/api/api-client"

/**
 * Lấy danh sách phụ huynh với query
 */
const getListParents = async (params?: {
    page?: number
    limit?: number
    search?: string
    isActive?: boolean
}) => {
    const response = await ApiService.get('/admin-center/parent-management', params)
    return {
        data: response.data as any[],
        pagination: response.meta?.pagination || {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0
        }
    }
}

/**
 * Lấy chi tiết phụ huynh theo ID
 */
const getParentById = async (id: string) => {
    const response = await ApiService.get(`/admin-center/parent-management/${id}`)
    return response.data as {
        id: string
        userId: string
        createdAt: string
        updatedAt: string
        user: {
            id: string
            email: string
            username: string
            fullName: string
            phone: string
            avatar: string | null
            isActive: boolean
            gender: 'MALE' | 'FEMALE' | 'OTHER' | null
            birthDate: string | null
            createdAt: string
            updatedAt: string
        }
        students: Array<{
            id: string
            studentCode: string
            address: string
            grade: string
            user: {
                id: string
                fullName: string
                email: string
                phone: string
                avatar: string | null
                isActive: boolean
            }
            school: {
                id: string
                name: string
                address: string
            }
            enrollments: Array<{
                id: string
                status: string
                enrolledAt: string
                class: {
                    id: string
                    name: string
                    grade: string
                    subject: {
                        id: string
                        name: string
                        code: string
                    }
                }
            }>
        }>
        payments: Array<{
            id: string
            amount: number
            method: string
            status: string
            reference: string | null
            paidAt: string
            notes: string | null
            feeRecord: {
                id: string
                amount: number
                dueDate: string
                status: string
                feeStructure: {
                    id: string
                    name: string
                    period: string
                }
                student: {
                    user: {
                        fullName: string
                    }
                }
            }
        }>
        studentCount: number
        paymentStats: {
            totalPaid: number
            totalPending: number
            paymentCount: number
        }
        pendingFees: Array<{
            id: string
            amount: number
            paidAmount: number
            dueDate: string
            status: string
            feeStructure: {
                id: string
                name: string
                period: string
            }
            student: {
                user: {
                    fullName: string
                }
            }
        }>
    }
}

/**
 * Đếm số lượng phụ huynh theo trạng thái
 */
const getCountByStatus = async () => {
    const response = await ApiService.get('/admin-center/parent-management/count-status')
    return response.data as {
        total: number
        active: number
        inactive: number
    }
}

/**
 * Tạo mới phụ huynh
 */
const createParent = async (data: {
    username: string
    password: string
    email: string
    fullName: string
    phone?: string
    gender?: 'MALE' | 'FEMALE' | 'OTHER'
    birthDate?: string
}) => {
    const response = await ApiService.post('/admin-center/parent-management', data)
    return response.data as any
}

/**
 * Cập nhật thông tin phụ huynh
 */
const updateParent = async (id: string, data: {
    email?: string
    fullName?: string
    phone?: string
    gender?: 'MALE' | 'FEMALE' | 'OTHER'
    birthDate?: string
}) => {
    const response = await ApiService.put(`/admin-center/parent-management/${id}`, data)
    return response.data as any
}

/**
 * Toggle trạng thái active của phụ huynh
 */
const toggleParentStatus = async (id: string) => {
    const response = await ApiService.patch(`/admin-center/parent-management/${id}/toggle-status`)
    return response.data as any
}

/**
 * Tìm kiếm học sinh theo mã để liên kết
 */
const searchStudentByCode = async (studentCode: string) => {
    const response = await ApiService.get('/admin-center/parent-management/search-student', {
        studentCode
    })
    return response.data as {
        id: string
        studentCode: string
        grade: string
        address: string
        user: {
            id: string
            email: string
            fullName: string
            phone: string
        }
        parent?: {
            id: string
            user: {
                id: string
                email: string
                fullName: string
                phone: string
            }
        } | null
        school: {
            id: string
            name: string
        }
    }
}

/**
 * Liên kết học sinh với phụ huynh
 */
const linkStudentToParent = async (parentId: string, studentId: string) => {
    const response = await ApiService.post(
        `/admin-center/parent-management/${parentId}/students`,
        { studentId }
    )
    return response.data as any
}

/**
 * Hủy liên kết học sinh khỏi phụ huynh
 */
const unlinkStudentFromParent = async (parentId: string, studentId: string) => {
    const response = await ApiService.delete(
        `/admin-center/parent-management/${parentId}/students/${studentId}`
    )
    return response.data as any
}

export const ParentService = {
    getListParents,
    getParentById,
    getCountByStatus,
    createParent,
    updateParent,
    toggleParentStatus,
    searchStudentByCode,
    linkStudentToParent,
    unlinkStudentFromParent
}