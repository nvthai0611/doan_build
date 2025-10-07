import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, BarChart3, UserCheck } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

export function DashboardTab(props: any) {
  const { classData } = props

  // Dữ liệu cho pie chart từ classData
  const attendanceData = [
    {
      name: 'Có mặt',
      value: classData?.classSession?.totalPresentCount || 0,
      color: '#22c55e'
    },
    {
      name: 'Vắng mặt',
      value: classData?.classSession?.totalAbsentCount || 0,
      color: '#ef4444'
    },
    {
      name: 'Có phép',
      value: classData?.classSession?.totalExcusedCount || 0,
      color: '#f59e0b'
    }
  ]

  const totalAttendance = attendanceData.reduce((sum, item) => sum + item.value, 0)

  const renderCustomLabel = (entry: any) => {
    const percent = totalAttendance > 0 ? ((entry.value / totalAttendance) * 100).toFixed(1) : 0
    return `${percent}%`
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div> 
                <p className="text-sm font-medium text-muted-foreground">Tổng học viên</p>
                <p className="text-2xl font-bold">{classData?.studentCount || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Buổi học hoàn thành</p>
                <p className="text-2xl font-bold">{classData?.classSession?.completed || 0}/{classData?.classSession?.total || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tỷ lệ tham gia</p>
                <p className="text-2xl font-bold">{classData?.classSession?.attendanceRate || 0}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thống kê điểm danh</CardTitle>
          </CardHeader>
          <CardContent>
            {totalAttendance > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [value, 'Số lượng']}
                  />
                  <Legend 
                    formatter={(value, entry: any) => (
                      <span style={{ color: entry.color }}>
                        {value}: {entry.payload.value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Chưa có dữ liệu điểm danh
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chi tiết điểm danh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Có mặt</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {classData?.classSession?.totalPresentCount || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium">Vắng mặt</span>
                </div>
                <span className="text-lg font-bold text-red-600">
                  {classData?.classSession?.totalAbsentCount || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium">Có phép</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">
                  {classData?.classSession?.totalExcusedCount || 0}
                </span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Tổng cộng</span>
                  <span className="text-lg font-bold">
                    {totalAttendance}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}