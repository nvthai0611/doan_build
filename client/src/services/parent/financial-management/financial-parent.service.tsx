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

const createQrCodeForPayment = async (paymentData: any) => {
    try {
        const response = await apiClient.post('/payment/sepay/create-qr', {
            feeRecordIds: paymentData
        })
        return response.data;
    } catch (error) {
        console.error('Error creating QR code:', error);
        throw error;
    }
}

const getPaymentHistory = async () => {
    try {
        const response = await apiClient.get('/parent/financial/payment-history')
        return response.data
    } catch (error) {
        console.error('Error fetching payment history:', error)
        throw error
    }
}

export default {
    getAllFeeRecordsOfParent,
    createQrCodeForPayment,
    getPaymentHistory
}