"use client"

export default function     StudentHomepage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Student Homepage</h1>
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold">Welcome, [Student Name]</h2>
        <p className="text-sm text-gray-500">Here&apos;s what&apos;s happening with your classes:</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <a href="/student/my-classes" className="bg-white p-4 rounded-lg shadow-md hover:bg-gray-50">
          <h3 className="text-lg font-bold">Lớp học của tôi</h3>
          <p className="text-sm text-gray-500">Xem danh sách lớp và chi tiết</p>
        </a>
        <a href="/student/my-schedule" className="bg-white p-4 rounded-lg shadow-md hover:bg-gray-50">
          <h3 className="text-lg font-bold">Lịch học</h3>
          <p className="text-sm text-gray-500">Xem lịch học theo tuần/tháng</p>
        </a>
        <a href="/student/my-grades" className="bg-white p-4 rounded-lg shadow-md hover:bg-gray-50">
          <h3 className="text-lg font-bold">Bảng điểm</h3>
          <p className="text-sm text-gray-500">Xem điểm, GPA và kết quả</p>
        </a>
      </div>
    </div>
  )
} 