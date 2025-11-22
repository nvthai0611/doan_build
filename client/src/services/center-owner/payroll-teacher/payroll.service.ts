import { apiClient } from "../../../utils/clientAxios"

interface PayrollAdjustmentPayload {
  adjustments: {
    payrollId: string
    items: {
      type: 'bonus' | 'deduction'
      amount: number
      reason: string
    }[]
  }[]
}
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

const getListPayrollsByTeacherId = async (teacherId: string, year?: string, classId?: string) => {
  try {
    const query = new URLSearchParams()
    if (teacherId) {
      query.append('teacherId', teacherId)
    }
    if (year) {
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

const sendPayrollNotification = async (payrollIds: string[]) => {
  return await apiClient.post(`admin-center/payroll-teacher/payroll/send-email`, { payrollIds })
}

const getPayrollBackPayDetails = async (payrollId: string): Promise<any> => {
  try {
    const response = await apiClient.get(
      `admin-center/payroll-teacher/${payrollId}/back-pay-details`
    )
    return response.data
  } catch (error) {
    console.error('Error fetching back pay details:', error)
    throw error
  }
}

const recalculatePayrolls = async (payrollIds: string[]): Promise<any> => {
  try {
    const response = await apiClient.post(
      `admin-center/payroll-teacher/recalculate`,
      { payrollIds }
    )
    return response.data
  } catch (error) {
    console.error('Error recalculating payrolls:', error)
    throw error
  }
}

// ✅ MỚI: Gửi lại email cho giáo viên
const resendPayrollEmail = async (payrollId: string): Promise<any> => {
  try {
    const response = await apiClient.post(
      `admin-center/payroll-teacher/payroll/${payrollId}/resend-email`
    )
    return response.data
  } catch (error) {
    console.error('Error resending payroll email:', error)
    throw error
  }
}

// ✅ MỚI: Tạo thanh toán lương
interface CreatePaymentPayload {
  payrollIds: string[]
  totalAmount: number
  paymentMethod: string
  notes?: string
}

const createPayrollPayment = async (payload: CreatePaymentPayload): Promise<any> => {
  try {
    const response = await apiClient.post(
      `admin-center/payroll-teacher/payment/create`,
      payload
    )
    return response.data
  } catch (error) {
    console.error('Error creating payroll payment:', error)
    throw error
  }
}

const applyPayrollAdjustments = async (payload: PayrollAdjustmentPayload): Promise<any> => {
  try {
    const response = await apiClient.post(
      `admin-center/payroll-teacher/adjustments/apply`,
      payload
    )
    return response.data
  } catch (error) {
    console.error('Error applying payroll adjustments:', error)
    throw error
  }
}

export const payrollService = {
  getListTeacher,
  getListPayrollsByTeacherId,
  getPayrollById,
  getSessionsByClassId,
  sendPayrollNotification,
  getPayrollBackPayDetails,
  recalculatePayrolls,
  resendPayrollEmail,
  createPayrollPayment,
  applyPayrollAdjustments
}