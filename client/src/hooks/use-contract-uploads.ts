import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { contractUploadService } from "../services/center-owner/contract-upload/contract-upload.service"
import type { CreateContractUploadDto, UpdateContractUploadDto } from "../services/center-owner/contract-upload/contract-upload.types"
import { toast } from "sonner"

export const useContractUploads = (studentId?: string) => {
  const queryClient = useQueryClient()

  // Fetch contract uploads
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['contract-uploads', studentId],
    queryFn: () => contractUploadService.getByStudentId(studentId!),
    enabled: !!studentId,
    staleTime: 30000,
  })

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: ({ studentId, data }: { studentId: string; data: CreateContractUploadDto }) =>
      contractUploadService.uploadContract(studentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-uploads', studentId] })
      toast.success("Upload đơn xin học thành công")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Upload thất bại")
    }
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ contractId, data }: { contractId: string; data: UpdateContractUploadDto }) =>
      contractUploadService.updateContract(contractId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-uploads', studentId] })
      toast.success("Cập nhật hợp đồng thành công")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Cập nhật thất bại")
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (contractId: string) => contractUploadService.deleteContract(contractId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-uploads', studentId] })
      toast.success("Xóa hợp đồng thành công")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xóa thất bại")
    }
  })

  return {
    contractUploads: data || [],
    isLoading,
    isError,
    refetch,
    uploadContract: uploadMutation.mutateAsync,
    updateContract: updateMutation.mutateAsync,
    deleteContract: deleteMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
