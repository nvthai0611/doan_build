import { apiClient } from "../../../utils/clientAxios"


    const getAllPayrolls = async ( filters: any): Promise<any> => {
    try {
      const searchParams = new URLSearchParams()
      if (filters?.month) {
        searchParams.append('month', filters.month)
      }
      if (filters?.status) {
        searchParams.append('status', filters.status)
      }
      searchParams.append('page', String(filters?.page || 1))
      searchParams.append('limit', String(filters?.limit || 10))

      const response = await apiClient.get<any>(
        `/teacher/payroll?${searchParams.toString()}`
      )

      return response
    } catch (error) {
      console.error('Error fetching payrolls:', error)
      throw error
    }

    }
const getPayrollDetail = async (payrollId: string, filters?: any): Promise<any> => {
  try {
    const searchParams = new URLSearchParams()
    
    if (filters?.classId) {
      searchParams.append('classId', filters.classId)
    }
    if (filters?.startDate) {
      searchParams.append('startDate', filters.startDate)
    }
    if (filters?.endDate) {
      searchParams.append('endDate', filters.endDate)
    }
    searchParams.append('page', String(filters?.page || 1))
    searchParams.append('limit', String(filters?.limit || 10))

    const queryString = searchParams.toString()
    const url = queryString 
      ? `/teacher/payroll/${payrollId}?${queryString}`
      : `/teacher/payroll/${payrollId}`

    const response = await apiClient.get(url)
    return response
  } catch (error) {
    console.error('Error fetching payroll detail:', error)
    throw error
  }
}

/**
 * Xác nhận duyệt bảng lương
 * @param payrollId - ID của payroll
 */
const approvePayroll = async (payrollId: string) => {
  try {
    const response = await apiClient.patch(
      `/teacher/payroll/${payrollId}/approve`
    )
    return response.data
  } catch (error) {
    console.error('Error approving payroll:', error)
    throw error
  }
}

/**
 * Từ chối bảng lương
 * @param payrollId - ID của payroll
 * @param reason - Lý do từ chối
 */
const rejectPayroll = async (payrollId: string, reason: string) => {
  try {
    const response = await apiClient.patch(
      `/teacher/payroll/${payrollId}/reject`,
      { reason }
    )
    return response.data
  } catch (error) {
    console.error('Error rejecting payroll:', error)
    throw error
  }
}




export {
    getAllPayrolls,
    getPayrollDetail,
    approvePayroll,
    rejectPayroll,
}