import React from 'react'
import { DollarSign, TrendingUp, TrendingDown, Clock } from 'lucide-react'

interface PayrollSummaryCardsProps {
  payrolls: any[]
  loading: boolean
}

const PayrollSummaryCards: React.FC<PayrollSummaryCardsProps> = ({ 
  payrolls, 
  loading 
}) => {
  const totalAmount = payrolls.reduce((sum, p) => sum + Number(p.totalAmount), 0)
  const totalBonuses = payrolls.reduce((sum, p) => sum + Number(p.bonuses), 0)
  const totalDeductions = payrolls.reduce((sum, p) => sum + Number(p.deductions), 0)
  const pendingCount = payrolls.filter(p => p.status === 'waiting_teacher_approval').length

  const cards = [
    {
      title: 'Tổng lương',
      value: totalAmount.toLocaleString('vi-VN'),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Tổng thưởng',
      value: totalBonuses.toLocaleString('vi-VN'),
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Tổng khấu trừ',
      value: totalDeductions.toLocaleString('vi-VN'),
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Chờ xác nhận',
      value: pendingCount.toString(),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{card.title}</p>
              <p className={`text-2xl font-bold ${card.color}`}>
                {card.title === 'Chờ xác nhận' ? card.value : `${card.value} đ`}
              </p>
            </div>
            <div className={`p-3 rounded-full ${card.bgColor}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PayrollSummaryCards
