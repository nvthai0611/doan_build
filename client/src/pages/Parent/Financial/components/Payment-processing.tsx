import { useQuery } from "@tanstack/react-query"
import financialParentService from "../../../../services/parent/financial-management/financial-parent.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const PaymentProcessing: React.FC = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['payment-processing'],
    queryFn: async () => {
      return await financialParentService.getPaymentByStatus('pending')
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  })

  if (isLoading) return <div>Đang tải...</div>
  if (isError) return <div>Lỗi khi tải dữ liệu</div>

  const payments = data as any || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Hóa đơn đang chờ thanh toán</CardTitle>
      </CardHeader>
      <CardContent>
        {payments?.length === 0 ? (
          <div className="text-muted-foreground text-sm">Không có hóa đơn nào đang xử lý</div>
        ) : (
          <ul className="space-y-4">
            {payments.map((payment: any) => (
              <li key={payment.id} className="border-b pb-2 last:border-b-0">
                <div className="font-medium">Mã đơn hàng: {payment.orderCode}</div>
                <div className="text-xs text-muted-foreground">Số tiền: {Number(payment.amount).toLocaleString("vi-VN")} đ</div>
                <div className="text-xs text-muted-foreground">Ngày tạo: {new Date(payment.createdAt).toLocaleString("vi-VN")}</div>
                <div className="text-xs text-yellow-600 font-semibold">Trạng thái: Đang chờ thanh toán</div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}