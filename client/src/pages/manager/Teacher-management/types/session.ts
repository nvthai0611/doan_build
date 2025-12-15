export interface ClassSessions {
  id: string;
  classId: string;
  teacherId: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  roomName: string;
  teacherName: string;
  subjectName: string;
  studentCount: number;
  maxStudents: number;
  status: string;
  hasAlert?: boolean;
  substituteTeacher?: string;
}