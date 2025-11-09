import { apiClient } from "../../../utils/clientAxios"

const getListTeacher = async (teacherName: string, email: string, status: string, month?: string) => {
  try {
    const query = new URLSearchParams()
    if (teacherName) {
      query.append('teacherName', teacherName)
    }
    if (email) {
      query.append('email', email)
    }
    if (status) {
      query.append('status', status)
    }
    if (month) {
      query.append('month', month)
    }
    const response = await apiClient.get(`admin-center/payroll-teacher/teachers?${query.toString()}`)
    return response.data
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const getListPayrollsByTeacherId = async (teacherId: string, year?: string, classId?: string) => { // Changed month to year
  try {
    const query = new URLSearchParams()
    if (teacherId) {
      query.append('teacherId', teacherId) // optional, teacherId đã ở path
    }
    if (year) { // Updated to accept year
      query.append('year', year)
    }
    if (classId) {
      query.append('classId', classId)
    }
    const response = await apiClient.get(`admin-center/payroll-teacher/payrolls/${teacherId}?${query.toString()}`)
    return response.data
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const getPayrollById = async (payrollId: string) => {
  try {
    const response = await apiClient.get(`admin-center/payroll-teacher/payroll/${payrollId}/detail`)
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

const getSessionsByClassId = async (classId: string, month?: string, teacherId?: string) => {
  try {
    const query = new URLSearchParams()
    if (month) query.append('month', month)
    if (teacherId) query.append('teacherId', teacherId)
    const response = await apiClient.get(`admin-center/payroll-teacher/classes/${classId}/sessions?${query.toString()}`)
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

const sendPayrollReminder = async (teacherIds: string[]) => {
  return ''
}

export const payrollService = {
  getListTeacher,
  getListPayrollsByTeacherId,
  getPayrollById,
  getSessionsByClassId,
  sendPayrollReminder
}