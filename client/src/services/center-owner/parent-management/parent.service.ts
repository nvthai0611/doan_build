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
    try {
        const response = await ApiService.post('/admin-center/parent-management', data)
        return response
    } catch (error) {
        console.error('Error creating parent:', error)
        throw error
    }
}

/**
 * Tạo mới phụ huynh kèm học sinh
 */
const createParentWithStudents = async (data: {
    username: string
    password: string
    email: string
    fullName: string
    phone?: string
    gender?: 'MALE' | 'FEMALE' | 'OTHER'
    birthDate?: string
    students?: Array<{
        fullName: string
        email: string
        studentCode?: string
        phone?: string
        gender?: 'MALE' | 'FEMALE' | 'OTHER'
        birthDate?: string
        address?: string
        grade?: string
        schoolId: string
    }>
}) => {
    try {
        const response = await ApiService.post('/admin-center/parent-management/with-students', data)
        return response
    } catch (error) {
        console.error('Error creating parent with students:', error)
        throw error
    }
}

/**
 * Thêm học sinh mới cho phụ huynh đã tồn tại
 */
const addStudentToParent = async (parentId: string, data: {
    fullName: string
    email: string
    studentCode?: string
    phone?: string
    gender?: 'MALE' | 'FEMALE' | 'OTHER'
    birthDate?: string
    address?: string
    grade?: string
    schoolId: string
    password?: string
}) => {
    try {
        const response = await ApiService.post(
            `/admin-center/parent-management/${parentId}/add-student`,
            data
        )
        return response
    } catch (error) {
        console.error('Error adding student to parent:', error)
        throw error
    }
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
    try {
        const response = await ApiService.put(`/admin-center/parent-management/${id}`, data)
        return response.data as any
    } catch (error) {
        console.error('Error updating parent:', error)
        throw error
    }
}

/**
 * Toggle trạng thái active của phụ huynh
 */
const toggleParentStatus = async (id: string) => {
    try {
        const response = await ApiService.patch(`/admin-center/parent-management/${id}/toggle-status`)
        return response.data as any
    } catch (error) {
        console.error('Error toggling parent status:', error)
        throw error
    }
}

/**
 * Tìm kiếm học sinh theo mã để liên kết
 */
const searchStudentByCode = async (studentCode: string) => {
    try {
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
    } catch (error) {
        console.error('Error searching student:', error)
        throw error
    }
}

/**
 * Liên kết học sinh với phụ huynh
 */
const linkStudentToParent = async (parentId: string, studentId: string) => {
    try {
        const response = await ApiService.post(
            `/admin-center/parent-management/${parentId}/students`,
            { studentId }
        )
        return response.data as any
    } catch (error) {
        console.error('Error linking student to parent:', error)
        throw error
    }
}

/**
 * Hủy liên kết học sinh khỏi phụ huynh
 */
const unlinkStudentFromParent = async (parentId: string, studentId: string) => {
    try {
        const response = await ApiService.delete(
            `/admin-center/parent-management/${parentId}/students/${studentId}`
        )
        return response.data as any
    } catch (error) {
        console.error('Error unlinking student from parent:', error)
        throw error
    }
}

export const ParentService = {
    getListParents,
    getParentById,
    getCountByStatus,
    createParent,
    createParentWithStudents,
    addStudentToParent,
    updateParent,
    toggleParentStatus,
    searchStudentByCode,
    linkStudentToParent,
    unlinkStudentFromParent
}