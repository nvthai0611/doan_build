import { apiClient } from '../../../utils/clientAxios'

export const contractsService = {
  async list() {
    const res = await apiClient.get('/teacher/contracts')
    return res.data
  },
  async upload(formData: FormData) {
    const res = await apiClient.post('/teacher/contracts/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },
  async remove(id: string) {
    const res = await apiClient.delete(`/teacher/contracts/${id}`)
    return res.data
  },
}
