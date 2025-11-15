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

export {
    getAllPayrolls,
    getPayrollDetail
}