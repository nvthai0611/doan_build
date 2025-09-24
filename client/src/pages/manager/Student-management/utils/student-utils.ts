import type { StudentWithDetails, StudentStatus, StudentFilters } from "../types/database"

export function filterStudents(students: StudentWithDetails[], filters: StudentFilters): StudentWithDetails[] {
  return students.filter((student) => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const searchableText = [
        student.user.fullName,
        student.user.username,
        student.user.email,
        student.user.phone,
        student.studentCode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      if (!searchableText.includes(searchTerm)) {
        return false
      }
    }

    // Status filter
    if (filters.status !== "all") {
      const statusMap: Record<StudentStatus, string[]> = {
        all: [],
        pending: ["Chờ xếp lớp"],
        upcoming: ["Sắp học"],
        studying: ["Đang học"],
        reserved: ["Bảo lưu"],
        stopped: ["Dừng học"],
        graduated: ["Tốt nghiệp"],
      }

      const allowedStatuses = statusMap[filters.status]
      if (allowedStatuses && !allowedStatuses.includes(student.status)) {
        return false
      }
    }

    // Date filters
    if (student.dateOfBirth) {
      const birthDate = new Date(student.dateOfBirth)

      if (filters.birthDay) {
        const day = Number.parseInt(filters.birthDay)
        if (birthDate.getDate() !== day) {
          return false
        }
      }

      if (filters.birthMonth) {
        const month = Number.parseInt(filters.birthMonth)
        if (birthDate.getMonth() + 1 !== month) {
          return false
        }
      }

      if (filters.birthYear) {
        const year = Number.parseInt(filters.birthYear)
        if (birthDate.getFullYear() !== year) {
          return false
        }
      }
    }

    return true
  })
}

export function sortStudents(
  students: StudentWithDetails[],
  sortBy: string,
  sortOrder: "asc" | "desc",
): StudentWithDetails[] {
  return [...students].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case "name":
        comparison = (a.user.fullName || a.user.username).localeCompare(b.user.fullName || b.user.username, "vi")
        break
      case "date":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case "balance":
        comparison = a.balance - b.balance
        break
      default:
        return 0
    }

    return sortOrder === "desc" ? -comparison : comparison
  })
}

export function getStatusCounts(students: StudentWithDetails[]) {
  const counts = {
    all: students.length,
    pending: 0,
    upcoming: 0,
    studying: 0,
    reserved: 0,
    stopped: 0,
    graduated: 0,
  }

  students.forEach((student) => {
    switch (student.status) {
      case "Chờ xếp lớp":
        counts.pending++
        break
      case "Sắp học":
        counts.upcoming++
        break
      case "Đang học":
        counts.studying++
        break
      case "Bảo lưu":
        counts.reserved++
        break
      case "Dừng học":
        counts.stopped++
        break
      case "Tốt nghiệp":
        counts.graduated++
        break
    }
  })

  return counts
}

export function updateStudentStatus(
  students: StudentWithDetails[],
  studentId: string,
  newStatus: string,
): StudentWithDetails[] {
  return students.map((student) => (student.id === studentId ? { ...student, status: newStatus as any } : student))
}

export function exportStudentsToCSV(students: StudentWithDetails[]): string {
  const headers = [
    "STT",
    "Họ tên",
    "Username",
    "Email",
    "Số điện thoại",
    "Mã học viên",
    "Ngày sinh",
    "Giới tính",
    "Địa chỉ",
    "Khối lớp",
    "Tên lớp",
    "Trạng thái",
    "Số khóa học",
    "Số lớp học",
    "Điểm trung bình",
    "Tổng học phí",
    "Số dư ví",
  ]

  const rows = students.map((student, index) => [
    index + 1,
    student.user.fullName || "",
    student.user.username,
    student.user.email || "",
    student.user.phone || "",
    student.studentCode || "",
    student.dateOfBirth ? student.dateOfBirth.toLocaleDateString("vi-VN") : "",
    student.gender || "",
    student.address || "",
    student.grade || "",
    student.className || "",
    student.status,
    student.totalCourses,
    student.totalClasses,
    student.averageGrade,
    student.totalFees,
    student.balance,
  ])

  const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

  return csvContent
}
