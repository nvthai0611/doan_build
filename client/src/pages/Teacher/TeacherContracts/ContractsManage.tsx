"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Plus } from "lucide-react"
import { ContractUploadDialog } from "../TeacherContracts/contracts/UpLoadContracts"
import { ContractsList } from "../TeacherContracts/contracts/ListContracts"
import { useAuth } from "../../../lib/auth"
import { contractsService } from "../../../services/teacher/contracts-management/contracts.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"


export interface Contract {
  id: string
  fileName: string
  uploadDate: string
  expiryDate: string
  status: "active" | "expiring_soon" | "expired"
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

    const activeContracts = contracts.filter((c) => c.status === "active").length
  const expiringContracts = contracts.filter((c) => c.status === "expiring_soon").length
  const expiredContracts = contracts.filter((c) => c.status === "expired").length

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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hợp đồng hoạt động</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeContracts}</div>
            <p className="text-xs text-muted-foreground">Hợp đồng hiện tại</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sắp hết hạn</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringContracts}</div>
            <p className="text-xs text-muted-foreground">Trong 30 ngày tới</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hợp đồng hết hạn</CardTitle>
            <FileText className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredContracts}</div>
            <p className="text-xs text-muted-foreground">Cần gia hạn</p>
          </CardContent>
        </Card>
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
