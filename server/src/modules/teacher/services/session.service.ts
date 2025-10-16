import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { SessionDetailResponseDto, StudentInSessionDto } from '../dto/session/session-detail-response.dto';
import { RescheduleSessionDto } from '../dto/session/reschedule-session.dto';
import { CreateSessionDto } from '../dto/session/create-session.dto';

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  private formatDateYYYYMMDD(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  async getSessionDetail(teacherId: string, sessionId: string): Promise<SessionDetailResponseDto | null> {
    try {
      const session = await this.prisma.classSession.findFirst({
        where: {
          id: sessionId,
          class: {
            teacherClassAssignments: {
              some: { teacherId }
            }
          }
        },
        include: {
          class: {
            include: {
              subject: { select: { name: true } },
              enrollments: {
                include: {
                  student: {
                    include: {
                      user: { select: { fullName: true, avatar: true } }
                    }
                  }
                }
              }
            }
          },
          room: { select: { name: true } },
          attendances: {
            include: {
              student: {
                include: {
                  user: { select: { fullName: true, avatar: true } }
                }
              }
            }
          }
        }
      });

      if (!session) {
        return null;
      }

      console.log(session);

      // Lấy thông tin giáo viên
      const teacherAssignment = await this.prisma.teacherClassAssignment.findFirst({
        where: {
          classId: session.classId,
          teacherId
        },
        include: {
          teacher: {
            include: {
              user: { select: { fullName: true } }
            }
          }
        }
      });

      // Tạo danh sách học viên với trạng thái điểm danh
      const students: StudentInSessionDto[] = session.class.enrollments.map(enrollment => {
        const attendance = session.attendances.find(att => att.studentId === enrollment.studentId);
        return {
          id: enrollment.student.id,
          name: enrollment.student.user.fullName || 'Chưa có tên',
          avatar: enrollment.student.user.avatar || undefined,
          attendanceStatus: attendance?.status || undefined
        };
      });

      return {
        id: session.id,
        date: this.formatDateYYYYMMDD(session.sessionDate),
        startTime: session.startTime,
        endTime: session.endTime,
        subject: session.class.subject.name,
        className: session.class.name,
        room: session.room?.name || 'Chưa xác định',
        studentCount: session.class.enrollments.length,
        status: session.status,
        notes: session.notes || undefined,
        type: 'regular',
        teacherId,
        teacherName: teacherAssignment?.teacher.user.fullName || undefined,
        students,
        createdAt: session.createdAt,
        updatedAt: session.createdAt
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy chi tiết buổi học: ${error.message}`);
    }
  }

  async rescheduleSession(
    teacherId: string, 
    sessionId: string, 
    rescheduleDto: RescheduleSessionDto
  ): Promise<SessionDetailResponseDto | null> {
    try {
      // Kiểm tra xem buổi học có thuộc về giáo viên này không
      const existingSession = await this.prisma.classSession.findFirst({
        where: {
          id: sessionId,
          class: {
            teacherClassAssignments: {
              some: { teacherId }
            }
          }
        }
      });

      if (!existingSession) {
        return null;
      }

      // Kiểm tra xem phòng học mới có sẵn không (nếu có thay đổi phòng)
      if (rescheduleDto.newRoomId && rescheduleDto.newRoomId !== existingSession.roomId) {
        const conflictingSession = await this.prisma.classSession.findFirst({
          where: {
            roomId: rescheduleDto.newRoomId,
            sessionDate: new Date(rescheduleDto.newDate),
            startTime: { lte: rescheduleDto.newEndTime },
            endTime: { gte: rescheduleDto.newStartTime },
            id: { not: sessionId }
          }
        });

        if (conflictingSession) {
          throw new Error('Phòng học đã được sử dụng trong khoảng thời gian này');
        }
      }

      // Tạo bản ghi thay đổi lịch
      await this.prisma.scheduleChange.create({
        data: {
          classId: existingSession.classId,
          originalDate: existingSession.sessionDate,
          originalTime: `${existingSession.startTime}-${existingSession.endTime}`,
          newDate: new Date(rescheduleDto.newDate),
          newTime: `${rescheduleDto.newStartTime}-${rescheduleDto.newEndTime}`,
          newRoomId: rescheduleDto.newRoomId || existingSession.roomId,
          reason: rescheduleDto.reason,
          status: 'pending',
          requestedBy: teacherId
        }
      });

      // Cập nhật buổi học
      const updatedSession = await this.prisma.classSession.update({
        where: { id: sessionId },
        data: {
          sessionDate: new Date(rescheduleDto.newDate),
          startTime: rescheduleDto.newStartTime,
          endTime: rescheduleDto.newEndTime,
          roomId: rescheduleDto.newRoomId || existingSession.roomId,
          notes: rescheduleDto.notes || existingSession.notes
        },
        include: {
          class: {
            include: {
              subject: { select: { name: true } },
              enrollments: {
                include: {
                  student: {
                    include: {
                      user: { select: { fullName: true, avatar: true } }
                    }
                  }
                }
              }
            }
          },
          room: { select: { name: true } },
          attendances: {
            include: {
              student: {
                include: {
                  user: { select: { fullName: true, avatar: true } }
                }
              }
            }
          }
        }
      });

      // Lấy thông tin giáo viên
      const teacherAssignment = await this.prisma.teacherClassAssignment.findFirst({
        where: {
          classId: updatedSession.classId,
          teacherId
        },
        include: {
          teacher: {
            include: {
              user: { select: { fullName: true } }
            }
          }
        }
      });

      // Tạo danh sách học viên
      const students: StudentInSessionDto[] = updatedSession.class.enrollments.map(enrollment => {
        const attendance = updatedSession.attendances.find(att => att.studentId === enrollment.studentId);
        return {
          id: enrollment.student.id,
          name: enrollment.student.user.fullName || 'Chưa có tên',
          avatar: enrollment.student.user.avatar || undefined,
          attendanceStatus: attendance?.status || undefined
        };
      });

      return {
        id: updatedSession.id,
        date: this.formatDateYYYYMMDD(updatedSession.sessionDate),
        startTime: updatedSession.startTime,
        endTime: updatedSession.endTime,
        subject: updatedSession.class.subject.name,
        className: updatedSession.class.name,
        room: updatedSession.room?.name || 'Chưa xác định',
        studentCount: updatedSession.class.enrollments.length,
        status: updatedSession.status,
        notes: updatedSession.notes || undefined,
        type: 'regular',
        teacherId,
        teacherName: teacherAssignment?.teacher.user.fullName || undefined,
        students,
        createdAt: updatedSession.createdAt,
        updatedAt: updatedSession.createdAt
      };
    } catch (error) {
      throw new Error(`Lỗi khi dời lịch buổi học: ${error.message}`);
    }
  }

  async createSession(teacherId: string, dto: CreateSessionDto) {
    try {
      // Verify teacher assignment to the class and get academicYear
      const assignment = await this.prisma.teacherClassAssignment.findFirst({
        where: { classId: dto.classId, teacherId, status: 'active' },
        select: { id: true, academicYear: true }
      })
      if (!assignment) {
        throw new Error('Bạn không được phân công lớp này hoặc lớp không hoạt động')
      }

      // Validate time range conflict: room conflict (if roomId)
      if (dto.roomId) {
        const conflictRoom = await this.prisma.classSession.findFirst({
          where: {
            roomId: dto.roomId,
            sessionDate: new Date(dto.sessionDate),
            startTime: { lte: dto.endTime },
            endTime: { gte: dto.startTime },
          }
        })
        if (conflictRoom) {
          throw new Error('Phòng học đã được sử dụng trong khoảng thời gian này')
        }
      }

      // Validate teacher time conflict across classes
      const conflictTeacher = await this.prisma.classSession.findFirst({
        where: {
          sessionDate: new Date(dto.sessionDate),
          startTime: { lte: dto.endTime },
          endTime: { gte: dto.startTime },
          class: {
            teacherClassAssignments: {
              some: { teacherId }
            }
          }
        }
      })
      if (conflictTeacher) {
        throw new Error('Bạn đã có buổi dạy khác trùng khung giờ này')
      }

      // const data = {
      //   classId: dto.classId,
      //   academicYear: assignment.academicYear,
      //   sessionDate: new Date(dto.sessionDate),
      //   startTime: dto.startTime,
      //   endTime: dto.endTime,
      //   roomId: dto.roomId,
      //   notes: dto.notes,
      // };
      // console.log(data);

      const created = await this.prisma.classSession.create({
        data: {
          classId: dto.classId,
          academicYear: assignment.academicYear,
          sessionDate: new Date(dto.sessionDate),
          startTime: dto.startTime,
          endTime: dto.endTime,
          roomId: dto.roomId,
          notes: dto.notes,
        },
        include: {
          room: { select: { name: true } }
        }
      })

      return created
    } catch (error) {
      throw error
    }
  }

  async getSessionStudents(teacherId: string, sessionId: string): Promise<StudentInSessionDto[]> {
    try {
      const session = await this.prisma.classSession.findFirst({
        where: {
          id: sessionId,
          class: {
            teacherClassAssignments: {
              some: { teacherId }
            }
          }
        },
        include: {
          class: {
            include: {
              enrollments: {
                include: {
                  student: {
                    include: {
                      user: { select: { fullName: true, avatar: true } }
                    }
                  }
                }
              }
            }
          },
          attendances: {
            include: {
              student: {
                include: {
                  user: { select: { fullName: true, avatar: true } }
                }
              }
            }
          }
        }
      });

      if (!session) {
        return [];
      }

      return session.class.enrollments.map(enrollment => {
        const attendance = session.attendances.find(att => att.studentId === enrollment.studentId);
        return {
          id: enrollment.student.id,
          name: enrollment.student.user.fullName || 'Chưa có tên',
          avatar: enrollment.student.user.avatar || undefined,
          attendanceStatus: attendance?.status || undefined
        };
      });
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách học viên: ${error.message}`);
    }
  }
}
