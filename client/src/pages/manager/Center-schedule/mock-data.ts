// Mock data based on the database schema
export interface MockSession {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  roomName: string;
  teacherName: string;
  subjectName: string;
  studentCount: number;
  maxStudents: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  hasAlert?: boolean;
}

export interface MockClass {
  id: string;
  name: string;
  subjectName: string;
  teacherName: string;
  grade: string;
  maxStudents: number;
  currentStudents: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
}

export interface MockTeacher {
  id: string;
  fullName: string;
  subjects: string[];
  phone: string;
  email: string;
}

export interface MockStudent {
  id: string;
  fullName: string;
  studentCode: string;
  grade: string;
  schoolName: string;
}

export interface MockRoom {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
}

// Generate mock sessions for September 2025
export const mockSessions: MockSession[] = [
  // September 1, 2025 (Sunday)
  {
    id: '1',
    name: 'Buổi 20',
    date: '2025-09-01',
    startTime: '14:00',
    endTime: '16:00',
    roomName: 'Phòng 101',
    teacherName: 'Nguyễn Văn A',
    subjectName: 'Toán học',
    studentCount: 9,
    maxStudents: 15,
    status: 'scheduled',
  },
  {
    id: '2',
    name: 'Buổi 23',
    date: '2025-09-01',
    startTime: '16:00',
    endTime: '18:00',
    roomName: 'Phòng 102',
    teacherName: 'Trần Thị B',
    subjectName: 'Vật lý',
    studentCount: 12,
    maxStudents: 15,
    status: 'cancelled',
  },

  // September 2, 2025 (Monday)
  {
    id: '3',
    name: 'Buổi 16',
    date: '2025-09-02',
    startTime: '14:00',
    endTime: '16:00',
    roomName: 'Phòng 103',
    teacherName: 'Lê Văn C',
    subjectName: 'Hóa học',
    studentCount: 3,
    maxStudents: 15,
    status: 'completed',
  },
  {
    id: '4',
    name: 'Buổi 9',
    date: '2025-09-02',
    startTime: '16:00',
    endTime: '18:00',
    roomName: 'Phòng 104',
    teacherName: 'Phạm Thị D',
    subjectName: 'Sinh học',
    studentCount: 2,
    maxStudents: 15,
    status: 'cancelled',
  },

  // September 3, 2025 (Tuesday)
  {
    id: '5',
    name: 'Buổi 7',
    date: '2025-09-03',
    startTime: '14:00',
    endTime: '16:00',
    roomName: 'Phòng 105',
    teacherName: 'Hoàng Văn E',
    subjectName: 'Toán học',
    studentCount: 8,
    maxStudents: 15,
    status: 'completed',
  },
  {
    id: '6',
    name: 'Buổi 17',
    date: '2025-09-03',
    startTime: '16:00',
    endTime: '18:00',
    roomName: 'Phòng 106',
    teacherName: 'Vũ Thị F',
    subjectName: 'Văn học',
    studentCount: 4,
    maxStudents: 15,
    status: 'scheduled',
  },

  // September 4, 2025 (Wednesday)
  {
    id: '7',
    name: 'Buổi 4',
    date: '2025-09-04',
    startTime: '14:00',
    endTime: '16:00',
    roomName: 'Phòng 107',
    teacherName: 'Đỗ Văn G',
    subjectName: 'Lịch sử',
    studentCount: 4,
    maxStudents: 15,
    status: 'scheduled',
  },
  {
    id: '8',
    name: 'Buổi 29',
    date: '2025-09-04',
    startTime: '16:00',
    endTime: '18:00',
    roomName: 'Phòng 108',
    teacherName: 'Bùi Thị H',
    subjectName: 'Địa lý',
    studentCount: 2,
    maxStudents: 15,
    status: 'scheduled',
  },

  // September 5, 2025 (Thursday)
  {
    id: '9',
    name: 'Buổi 8',
    date: '2025-09-05',
    startTime: '14:00',
    endTime: '16:00',
    roomName: 'Phòng 109',
    teacherName: 'Ngô Văn I',
    subjectName: 'Tiếng Anh',
    studentCount: 3,
    maxStudents: 15,
    status: 'scheduled',
  },
  {
    id: '10',
    name: 'Buổi 3',
    date: '2025-09-05',
    startTime: '16:00',
    endTime: '18:00',
    roomName: 'Phòng 110',
    teacherName: 'Đinh Thị J',
    subjectName: 'Toán học',
    studentCount: 2,
    maxStudents: 15,
    status: 'scheduled',
  },

  // September 6, 2025 (Friday)
  {
    id: '11',
    name: 'Buổi 14',
    date: '2025-09-06',
    startTime: '14:00',
    endTime: '16:00',
    roomName: 'Phòng 111',
    teacherName: 'Lý Văn K',
    subjectName: 'Vật lý',
    studentCount: 27,
    maxStudents: 30,
    status: 'scheduled',
  },
  {
    id: '12',
    name: 'Buổi 16',
    date: '2025-09-06',
    startTime: '16:00',
    endTime: '18:00',
    roomName: 'Phòng 112',
    teacherName: 'Mai Thị L',
    subjectName: 'Hóa học',
    studentCount: 2,
    maxStudents: 15,
    status: 'scheduled',
  },

  // Continue with more sessions for the rest of September...
  // September 25, 2025 (Thursday) - Current day highlighted in red
  {
    id: '25',
    name: 'Buổi 32',
    date: '2025-09-25',
    startTime: '14:00',
    endTime: '16:00',
    roomName: 'Phòng 201',
    teacherName: 'Nguyễn Văn X',
    subjectName: 'Toán học',
    studentCount: 7,
    maxStudents: 15,
    status: 'scheduled',
  },
  {
    id: '26',
    name: 'Buổi 7',
    date: '2025-09-25',
    startTime: '18:00',
    endTime: '20:00',
    roomName: 'Phòng 202',
    teacherName: 'Trần Thị Y',
    subjectName: 'Vật lý',
    studentCount: 4,
    maxStudents: 15,
    status: 'scheduled',
    hasAlert: true,
  },
  {
    id: '27',
    name: 'Buổi 12',
    date: '2025-09-25',
    startTime: '18:00',
    endTime: '20:00',
    roomName: 'Phòng 203',
    teacherName: 'Lê Văn Z',
    subjectName: 'Hóa học',
    studentCount: 18,
    maxStudents: 20,
    status: 'scheduled',
  },
  {
    id: '28',
    name: 'Buổi 18',
    date: '2025-09-25',
    startTime: '19:00',
    endTime: '21:00',
    roomName: 'Phòng 204',
    teacherName: 'Phạm Thị AA',
    subjectName: 'Sinh học',
    studentCount: 27,
    maxStudents: 30,
    status: 'scheduled',
  },
];

export const mockClasses: MockClass[] = [
  {
    id: '1',
    name: 'Lớp Toán 10A',
    subjectName: 'Toán học',
    teacherName: 'Nguyễn Văn A',
    grade: 'Lớp 10',
    maxStudents: 15,
    currentStudents: 12,
    status: 'active',
  },
  {
    id: '2',
    name: 'Lớp Lý 11B',
    subjectName: 'Vật lý',
    teacherName: 'Trần Thị B',
    grade: 'Lớp 11',
    maxStudents: 15,
    currentStudents: 14,
    status: 'active',
  },
];

export const mockTeachers: MockTeacher[] = [
  {
    id: '1',
    fullName: 'Nguyễn Văn A',
    subjects: ['Toán học'],
    phone: '0901234567',
    email: 'nguyenvana@example.com',
  },
  {
    id: '2',
    fullName: 'Trần Thị B',
    subjects: ['Vật lý', 'Hóa học'],
    phone: '0901234568',
    email: 'tranthib@example.com',
  },
];

export const mockRooms: MockRoom[] = [
  {
    id: '1',
    name: 'Phòng 101',
    capacity: 15,
    equipment: ['Máy chiếu', 'Bảng trắng'],
  },
  {
    id: '2',
    name: 'Phòng 102',
    capacity: 20,
    equipment: ['Máy chiếu', 'Bảng trắng', 'Máy tính'],
  },
];
