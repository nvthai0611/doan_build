import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';

@Injectable()
export class ParentOverviewService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy overview dashboard data cho parent
   */
  async getParentOverview(parentUserId: string, date?: string) {
    // Get parent with students
    const parent = await this.prisma.parent.findUnique({
      where: { userId: parentUserId },
      include: {
        user: {
          select: {
            fullName: true,
            gender: true,
          },
        },
        students: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
            enrollments: {
              where: {
                status: 'studying',
                class: {
                  status: 'active', // Chỉ lấy lớp đang active
                },
              },
              include: {
                class: {
                  include: {
                    subject: true,
                    teacher: {
                      include: {
                        user: {
                          select: {
                            fullName: true,
                          },
                        },
                      },
                    },
                    room: true,
                    sessions: {
                      where: {
                        sessionDate: date
                          ? new Date(date)
                          : {
                              gte: new Date(
                                new Date().setHours(0, 0, 0, 0),
                              ),
                              lte: new Date(
                                new Date().setHours(23, 59, 59, 999),
                              ),
                            },
                      },
                      orderBy: {
                        startTime: 'asc',
                      },
                      include: {
                        attendances: {
                          where: {
                            student: {
                              parentId: {
                                equals: await this.prisma.parent
                                  .findUnique({
                                    where: { userId: parentUserId },
                                    select: { id: true },
                                  })
                                  .then((p) => p?.id || ''),
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!parent) {
      throw new HttpException(
        'Không tìm thấy thông tin phụ huynh',
        HttpStatus.NOT_FOUND,
      );
    }

    // Transform data for frontend
    const upcomingLessons: any[] = [];
    const activeClasses: any[] = [];

    // Process each student's enrollments
    for (const student of parent.students) {
      for (const enrollment of student.enrollments) {
        const classData = enrollment.class;

        // Get ALL sessions for progress calculation (not just today's sessions)
        const allSessions = await this.prisma.classSession.findMany({
          where: {
            classId: classData.id,
          },
        });

        const totalSessions = allSessions.length || 1;
        const completedSessions =
          allSessions.filter((s) => s.status === 'end').length || 0;
        const progress = Math.round((completedSessions / totalSessions) * 100);

        // Get next upcoming session for this class
        const nextSession = await this.prisma.classSession.findFirst({
          where: {
            classId: classData.id,
            status: 'has_not_happened',
            sessionDate: {
              gte: new Date(),
            },
          },
          orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
        });

        // Parse recurring schedule from actual sessions
        let scheduleText = 'Chưa có lịch';
        
        if (allSessions && allSessions.length > 0) {
          const scheduleMap = new Map();
          const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

          allSessions.forEach((session) => {
            const date = new Date(session.sessionDate);
            const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, ...
            const dayOfWeek = dayNames[dayIndex];

            const key = `${dayIndex}-${session.startTime}-${session.endTime}`;

            if (!scheduleMap.has(key)) {
              scheduleMap.set(key, {
                dayIndex: dayIndex,
                dayOfWeek: dayOfWeek,
                startTime: session.startTime,
                endTime: session.endTime,
              });
            }
          });

          const schedule = Array.from(scheduleMap.values());

          if (schedule.length > 0) {
            // Group by time if all sessions have same time
            const timeGroups = new Map();
            schedule.forEach(s => {
              const timeKey = `${s.startTime}-${s.endTime}`;
              if (!timeGroups.has(timeKey)) {
                timeGroups.set(timeKey, []);
              }
              timeGroups.get(timeKey).push({ dayIndex: s.dayIndex, dayOfWeek: s.dayOfWeek });
            });

            // Format schedule text
            const scheduleTexts = Array.from(timeGroups.entries()).map(([timeKey, daysData]) => {
              const [startTime, endTime] = timeKey.split('-');
              
              // Sort days by dayIndex (0=Sunday, 1=Monday, ...)
              daysData.sort((a, b) => a.dayIndex - b.dayIndex);
              
              const days = daysData.map(d => d.dayOfWeek).join(', ');
              return `${days}: ${startTime} - ${endTime}`;
            });

            scheduleText = scheduleTexts.join(' | ');
          }
        }

        // Format next class info
        let nextClassInfo = 'Chưa có lịch';
        if (nextSession) {
          const sessionDate = new Date(nextSession.sessionDate);
          const dayOfWeek = [
            'Chủ nhật',
            'Thứ hai',
            'Thứ ba',
            'Thứ tư',
            'Thứ năm',
            'Thứ sáu',
            'Thứ bảy',
          ][sessionDate.getDay()];
          const dateStr = `${sessionDate.getDate().toString().padStart(2, '0')}/${(sessionDate.getMonth() + 1).toString().padStart(2, '0')}/${sessionDate.getFullYear()}`;
          nextClassInfo = `${dayOfWeek}, ${dateStr} (${nextSession.startTime} - ${nextSession.endTime})`;
        }

        activeClasses.push({
          id: classData.id,
          name: classData.name,
          subject: classData.subject.name,
          teacher: classData.teacher?.user?.fullName || 'Chưa phân công',
          room: classData.room?.name || 'Chưa phân phòng',
          progress,
          schedule: scheduleText,
          studentName: student.user.fullName,
          nextClass: nextClassInfo,
        });

        // Add today's sessions to upcoming lessons
        classData.sessions.forEach((session) => {
          const attendance = session.attendances.find(
            (a) => a.studentId === student.id,
          );

          upcomingLessons.push({
            id: session.id,
            className: classData.name,
            subject: classData.subject.name,
            time: `${session.startTime} - ${session.endTime}`,
            room: classData.room?.name || 'Chưa phân phòng',
            teacher: classData.teacher?.user?.fullName || 'Chưa phân công',
            status:
              session.status === 'has_not_happened'
                ? 'Chưa diễn ra'
                : session.status === 'happening'
                ? 'Đang diễn ra'
                : session.status === 'end'
                ? 'Đã kết thúc'
                : session.status === 'day_off'
                ? 'Nghỉ học'
                : 'Chưa diễn ra',
            attendanceStatus: attendance
              ? attendance.status === 'present'
                ? 'Có mặt'
                : attendance.status === 'absent'
                ? 'Vắng'
                : 'Chưa điểm danh'
              : 'Chưa điểm danh',
            studentName: student.user.fullName,
          });
        });
      }
    }

    return {
      parentName: parent.user.fullName || 'Phụ huynh',
      gender: parent.user.gender,
      upcomingLessons,
      activeClasses,
      studentCount: parent.students.length,
    };
  }
}
