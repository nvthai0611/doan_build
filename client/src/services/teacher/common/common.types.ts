// Common types for teacher common services

export interface Student {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  gender?: string;
  birthDate?: string;
}

export interface School {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface Class {
  id: string;
  name: string;
  grade: string;
  subject: Subject;
}

export interface Teacher {
  id: string;
  user: {
    fullName: string;
    email: string;
  };
}

export interface Grade {
  id: string;
  score: number;
  assessment: {
    id: string;
    name: string;
    type: string;
    date: string;
  };
}

export interface Enrollment {
  id: string;
  studentId: string;
  student: {
    id: string;
    user: Student;
    school: School;
    grades: Grade[];
  };
  class: Class;
  teacherClassAssignment: {
    id: string;
    semester: string;
    academicYear: string;
    teacher: Teacher;
  };
  enrolledAt: string;
  status: string;
  completedAt?: string;
}

export interface StudentListResponse {
  success: boolean;
  data: Enrollment[];
  message: string;
}

export interface StudentDetailResponse {
  success: boolean;
  data: {
    student: {
      id: string;
      user: Student;
      school: School;
      grades: Grade[];
    };
    enrollment: {
      id: string;
      status: string;
      enrolledAt: string;
      completedAt?: string;
    };
    attendance: {
      total: number;
      present: number;
      absent: number;
      percentage: number;
    };
    class: Class;
    teacher: Teacher;
  };
  message: string;
}

export interface ClassStatisticsResponse {
  success: boolean;
  data: {
    totalStudents: number;
    attendanceStats: {
      totalSessions: number;
      averageAttendance: number;
      attendanceRate: number;
    };
    gradeStats: {
      totalGrades: number;
      averageGrade: number;
      highestGrade: number;
      lowestGrade: number;
    };
  };
  message: string;
}
