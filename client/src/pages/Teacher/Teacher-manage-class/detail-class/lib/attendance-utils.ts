
export const ATTENDANCE_STATUS = {
  PRESENT: "present",
  ABSENT: "absent",
  SCHEDULE: "late",
  EXCUSED: "excused",
} as const

export const ATTENDANCE_STATUS_CONFIG = {
  present: {
    label: "Có mặt",
    color: "text-green-600 bg-green-50 border-green-200",
    darkColor: "dark:text-green-400 dark:bg-green-950 dark:border-green-800",
    icon: "✓",
  },
  absent: {
    label: "Vắng",
    color: "text-red-600 bg-red-50 border-red-200",
    darkColor: "dark:text-red-400 dark:bg-red-950 dark:border-red-800",
    icon: "✗",
  },
  schedule: {
    label: "Chưa mở",
    color: "text-orange-600 bg-orange-50 border-orange-200",
    darkColor: "dark:text-orange-400 dark:bg-orange-950 dark:border-orange-800",
    icon: "⏰",
  },
  excused: {
    label: "Có phép",
    color: "text-blue-600 bg-blue-50 border-blue-200",
    darkColor: "dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800",
    icon: "📝",
  },
} as const

export function calculateAttendanceStats(
  students: any[],
  attendanceRecords: any[],
): any[] {
  return students.map((student) => {
    const attendanceMap = new Map<string, any>()
    let present = 0
    let absent = 0
    let excused = 0
    // Nếu AttendanceRecords mà có session status là 'scheduled' thì không tính vào thống kê
    attendanceRecords = attendanceRecords.filter((record) => record.session.status !== 'scheduled')
    attendanceRecords.forEach((record) => {
      const attendance = record.attendances.find((a: any) => a.studentId === student.id)
      attendanceMap.set(record.session.id, attendance || null)

      if (attendance) {
        switch (attendance.status) {
          case ATTENDANCE_STATUS.PRESENT:
            present++
            break
          case ATTENDANCE_STATUS.ABSENT:
            absent++
            break
          case ATTENDANCE_STATUS.EXCUSED:
            excused++
            break
        }
      }
    })

    return {
      student,
      attendanceRecords: attendanceMap,
      stats: {
        present,
        absent,
        excused,
        total: attendanceRecords.length,
      },
    }
  })
}

export function formatSessionDate(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date))
}

export function formatSessionTime(startTime: string, endTime: string): string {
  return `${startTime} - ${endTime}`
}

export function getAttendanceRate(present: number, total: number): number {
  if (total === 0) return 0
  return Math.round((present / total) * 100)
}
