import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Users, Clock, CheckCircle2 } from 'lucide-react';

interface DashboardTabProps {
  classData: any;
}

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#6b7280'];

export default function DashboardTab({ classData }: DashboardTabProps) {
  const classSession = classData?.classSession ?? {
    total: 0,
    completed: 0,
    upcoming: 0,
    attendanceRate: 0,
    totalPresentCount: 0,
    totalAbsentCount: 0,
    totalExcusedCount: 0,
  };

  const attendanceData = [
    { name: 'Có mặt', value: classSession?.totalPresentCount ?? 0 },
    { name: 'Vắng', value: classSession?.totalAbsentCount ?? 0 },
    { name: 'Xin phép', value: classSession?.totalExcusedCount ?? 0 },
  ];

  const stats = [
    {
      icon: Users,
      label: 'Tổng học sinh',
      value: classData?.studentCount ?? 0,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      icon: Clock,
      label: 'Buổi học hoàn thành',
      value: classSession?.completed ?? 0,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      icon: AlertCircle,
      label: 'Buổi học sắp tới',
      value: classSession?.upcoming ?? 0,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
    },
    {
      icon: CheckCircle2,
      label: 'Tỷ lệ tham gia',
      value: `${classSession?.attendanceRate ?? 0}%`,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle>Thống kê điểm danh</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Session Info */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle>Thông tin buổi học</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Tổng buổi học:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {classSession?.total ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Buổi đã hoàn thành:</span>
                <span className="font-medium text-green-600">
                  {classSession?.completed ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Buổi sắp tới:</span>
                <span className="font-medium text-yellow-600">
                  {classSession?.upcoming ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Tỷ lệ tham gia trung bình:</span>
                <span className="font-medium text-purple-600">
                  {classSession?.attendanceRate ?? 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Số người tham gia trung bình:</span>
                <span className="font-medium text-blue-600">
                  {classSession?.averageAttendancePerSession ?? 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}