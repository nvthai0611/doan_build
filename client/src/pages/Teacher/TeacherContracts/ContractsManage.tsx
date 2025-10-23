"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ContractUploadDialog } from "../TeacherContracts/contracts/UpLoadContracts"
import { ContractsList } from "../TeacherContracts/contracts/ListContracts"
import { useAuth } from "../../../lib/auth"
import { contractsService } from "../../../services/teacher/contracts-management/contracts.service"


export interface Contract {
  id: string
  fileName: string
  uploadDate: string
  expiryDate: string
  fileSize: string
  type: "employment" | "probation" | "renewal" | "other"
  notes?: string
}

export default function ContractsPage() {
  const { user } = useAuth()
  const [contracts, setContracts] = useState<any[]>([])
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load contracts from localStorage
  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const res: any = await contractsService.list()
        if (mounted) setContracts(res.data || res)
      } catch (e) {
        console.error('Failed to load contracts', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => { mounted = false }
  }, [user?.id])

  const handleAddContract = (newContract: any) => {
    const updatedContracts = [newContract, ...contracts]
    setContracts(updatedContracts)
    setIsUploadDialogOpen(false)
  }

  const handleDeleteContract = (contractId: string) => {
    contractsService.remove(contractId).then(() => {
      const updatedContracts = contracts.filter((c) => c.id !== contractId)
      setContracts(updatedContracts)
    }).catch((e) => console.error(e))
  }

  if (loading) {
    return <div className="p-6">Đang tải...</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Quản lý hợp đồng</h1>
          <p className="text-muted-foreground mt-1">Lưu trữ và theo dõi các hợp đồng của bạn</p>
        </div>
        <Button onClick={() => setIsUploadDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Tải lên hợp đồng
        </Button>
      </div>

      {/* Contracts List */}
      <ContractsList contracts={contracts} onDelete={handleDeleteContract} />

      {/* Upload Dialog */}
      <ContractUploadDialog
        isOpen={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onAddContract={handleAddContract}
      />
    </div>
  )
}
