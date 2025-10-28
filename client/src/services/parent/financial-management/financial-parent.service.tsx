import { apiClient } from "../../../utils/clientAxios"

const getAllFeeRecordsOfParent = async (status: string) => {
    try {
        const query = new URLSearchParams()
        if(status){
            query.append('status', status)
        }
        const response = await apiClient.get(`/parent/financial/fee-records?${query.toString()}`)
        return response.data;
    } catch (error) {
        console.error('Error fetching fee records:', error);
        throw error;
    }
}

/**
 * Tạo mã QR thanh toán cho payment (chỉ cần truyền paymentId)
 */
const createQrCodeForPayment = async (paymentId: string) => {
  try {
    const response = await apiClient.post('/payment/sepay/create-qr', {
      paymentId
    })
    return response.data
  } catch (error) {
    console.error('Error creating QR code:', error)
    throw error
  }
}

const getPaymentDetails = async (paymentId: string) => {
    try {
        const response = await apiClient.get(`/parent/financial/${paymentId}/detail`)
        return response.data
    } catch (error) {
        console.error('Error fetching payment details:', error)
        throw error
    }
}
const getPaymentByStatus = async (status: string) => {
    try {
        const query = new URLSearchParams()
        if(status){
            query.append('status', status)
        }
        const response = await apiClient.get(`/parent/financial/payment-history?${query.toString()}`)
        return response.data
    } catch (error) {
        console.error('Error fetching payment history:', error)
        throw error
    }
}

const createPaymentForFeeRecords = async (feeRecordIds: string[]) => {
  try {
    const response = await apiClient.post('/parent/financial/create-payment', {
      feeRecordIds
    })
    return response.data
  } catch (error) {
    console.error('Error creating payment:', error)
    throw error
  }
}

const updatePaymentFeeRecords = async (paymentId: string, feeRecordIds: string[]) => {
  try {
    const response = await apiClient.patch('/parent/financial/update-payment-fee-records', {
      paymentId,
      feeRecordIds
    })
    return response.data
  } catch (error) {
    console.error('Error updating payment fee records:', error)
    throw error
  }
}

export default {
    getAllFeeRecordsOfParent,
    createQrCodeForPayment,
    getPaymentByStatus,
    createPaymentForFeeRecords,
    updatePaymentFeeRecords,
    getPaymentDetails
}