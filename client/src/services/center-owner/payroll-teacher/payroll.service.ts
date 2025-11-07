import { apiClient } from "../../../utils/clientAxios"

const getListTeacher = async (teacherName: string, email: string, status: string, month?: string) =>{
    try {
        const query = new URLSearchParams()
    if(teacherName){
        query.append('teacherName', teacherName)
    }
    if(email){
        query.append('email', email)
    }
    if(status){
        query.append('status', status)
    }
    if(month){
        query.append('month', month)
    }
    const response = await apiClient.get(`admin-center/payroll-teacher/teachers?${query.toString()}`)
    return response.data
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const payrollService = {
    getListTeacher
}