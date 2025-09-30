import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { ScheduleFiltersDto } from '../dto/schedule/schedule-filters.dto';
import { UpdateScheduleStatusDto } from '../dto/schedule/update-schedule-status.dto';

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async getTeacherSchedule(teacherId: string, filters: ScheduleFiltersDto) {
    try {
      // Tạm thời trả về mock data để test giao diện
      const mockSchedules = [
        {
          id: "1",
          date: "2025-09-01",
          startTime: "14:00",
          endTime: "16:00",
          subject: "Toán học",
          className: "12A1",
          room: "A101",
          studentCount: 35,
          status: "scheduled",
          notes: "Buổi học thường",
          type: "regular",
          teacherId: teacherId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "2",
          date: "2025-09-01",
          startTime: "14:00",
          endTime: "16:00",
          subject: "Vật lý",
          className: "11B2",
          room: "B201",
          studentCount: 30,
          status: "scheduled",
          notes: "Buổi học thường",
          type: "regular",
          teacherId: teacherId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "3",
          date: "2025-09-03",
          startTime: "14:00",
          endTime: "16:00",
          subject: "Hóa học",
          className: "10C1",
          room: "C301",
          studentCount: 28,
          status: "scheduled",
          notes: "Buổi học bù",
          type: "makeup",
          teacherId: teacherId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "4",
          date: "2025-09-05",
          startTime: "14:00",
          endTime: "16:00",
          subject: "Toán học",
          className: "12A2",
          room: "A102",
          studentCount: 32,
          status: "scheduled",
          notes: "Buổi học thường",
          type: "regular",
          teacherId: teacherId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "5",
          date: "2025-09-06",
          startTime: "14:00",
          endTime: "16:00",
          subject: "Vật lý",
          className: "11B1",
          room: "B202",
          studentCount: 29,
          status: "scheduled",
          notes: "Buổi học thường",
          type: "regular",
          teacherId: teacherId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "6",
          date: "2025-09-06",
          startTime: "14:00",
          endTime: "16:00",
          subject: "Hóa học",
          className: "10C2",
          room: "C302",
          studentCount: 26,
          status: "scheduled",
          notes: "Buổi học bù",
          type: "makeup",
          teacherId: teacherId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "7",
          date: "2025-09-07",
          startTime: "14:00",
          endTime: "16:00",
          subject: "Toán học",
          className: "12A3",
          room: "A103",
          studentCount: 33,
          status: "scheduled",
          notes: "Buổi học thường",
          type: "regular",
          teacherId: teacherId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "8",
          date: "2025-09-10",
          startTime: "14:00",
          endTime: "16:00",
          subject: "Vật lý",
          className: "11B3",
          room: "B203",
          studentCount: 31,
          status: "scheduled",
          notes: "Buổi học thường",
          type: "regular",
          teacherId: teacherId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "9",
          date: "2025-09-12",
          startTime: "14:00",
          endTime: "16:00",
          subject: "Toán học",
          className: "12A1",
          room: "A101",
          studentCount: 35,
          status: "scheduled",
          notes: "Buổi học thường",
          type: "regular",
          teacherId: teacherId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "10",
          date: "2025-09-12",
          startTime: "14:00",
          endTime: "16:00",
          subject: "Hóa học",
          className: "10C1",
          room: "C301",
          studentCount: 28,
          status: "scheduled",
          notes: "Buổi học bù",
          type: "makeup",
          teacherId: teacherId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "11",
          date: "2025-09-17",
          startTime: "14:00",
          endTime: "16:00",
          subject: "Vật lý",
          className: "11B2",
          room: "B201",
          studentCount: 30,
          status: "scheduled",
          notes: "Buổi học thường",
          type: "regular",
          teacherId: teacherId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "12",
          date: "2025-09-18",
          startTime: "14:00",
          endTime: "16:00",
          subject: "Hóa học",
          className: "10C2",
          room: "C302",
          studentCount: 26,
          status: "scheduled",
          notes: "Buổi học bù",
          type: "makeup",
          teacherId: teacherId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "13",
          date: "2025-09-19",
          startTime: "14:00",
          endTime: "16:00",
          subject: "Toán học",
          className: "12A2",
          room: "A102",
          studentCount: 32,
          status: "scheduled",
          notes: "Buổi học thường",
          type: "regular",
          teacherId: teacherId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "14",
          date: "2025-09-19",
          startTime: "14:00",
          endTime: "16:00",
          subject: "Vật lý",
          className: "11B1",
          room: "B202",
          studentCount: 29,
          status: "scheduled",
          notes: "Buổi học thường",
          type: "regular",
          teacherId: teacherId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "15",
          date: "2025-09-20",
          startTime: "14:00",
          endTime: "16:00",
          subject: "Toán học",
          className: "12A3",
          room: "A103",
          studentCount: 33,
          status: "scheduled",
          notes: "Buổi học thường",
          type: "regular",
          teacherId: teacherId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "16",
          date: "2025-09-21",
          startTime: "14:00",
          endTime: "16:00",
          subject: "Hóa học",
          className: "10C1",
          room: "C301",
          studentCount: 28,
          status: "scheduled",
          notes: "Buổi học thường",
          type: "regular",
          teacherId: teacherId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "17",
          date: "2025-09-22",
          startTime: "14:00",
          endTime: "16:00",
          subject: "Vật lý",
          className: "11B3",
          room: "B203",
          studentCount: 31,
          status: "scheduled",
          notes: "Buổi học thường",
          type: "regular",
          teacherId: teacherId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "18",
          date: "2025-09-25",
          startTime: "14:00",
          endTime: "16:00",
          subject: "Toán học",
          className: "12A1",
          room: "A101",
          studentCount: 35,
          status: "scheduled",
          notes: "Buổi học thường",
          type: "regular",
          teacherId: teacherId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Filter mock data based on filters
      let filteredSchedules = mockSchedules;

      if (filters.status && filters.status !== 'all') {
        filteredSchedules = filteredSchedules.filter(s => s.status === filters.status);
      }

      if (filters.fromDate) {
        filteredSchedules = filteredSchedules.filter(s => s.date >= filters.fromDate);
      }

      if (filters.toDate) {
        filteredSchedules = filteredSchedules.filter(s => s.date <= filters.toDate);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredSchedules = filteredSchedules.filter(s =>
          s.subject.toLowerCase().includes(searchLower) ||
          s.className.toLowerCase().includes(searchLower) ||
          s.room.toLowerCase().includes(searchLower) ||
          (s.notes && s.notes.toLowerCase().includes(searchLower))
        );
      }

      return filteredSchedules;
    } catch (error) {
      throw new Error(`Lỗi khi lấy lịch dạy: ${error.message}`);
    }
  }


  async getWeeklySchedule(teacherId: string, weekStart: string) {
    // try {
    //   const startDate = new Date(weekStart);
    //   const endDate = new Date(startDate);
    //   endDate.setDate(endDate.getDate() + 6);

    //   const schedules = await this.prisma.classSession.findMany({
    //     where: {
    //       class: { teacherId },
    //       sessionDate: {
    //         gte: startDate,
    //         lte: endDate
    //       }
    //     },
    //     include: {
    //       class: {
    //         include: {
    //           subject: { select: { name: true } }
    //         }
    //       },
    //       room: { select: { name: true } }
    //     },
    //     orderBy: [
    //       { sessionDate: 'asc' },
    //       { startTime: 'asc' }
    //     ]
    //   });

    //   return schedules.map(session => ({
    //     id: session.id,
    //     date: session.sessionDate,
    //     startTime: session.startTime,
    //     endTime: session.endTime,
    //     subject: session.class.subject.name,
    //     className: session.class.name,
    //     room: session.room?.name || 'Chưa xác định',
    //     studentCount: session.class.maxStudents || 0,
    //     status: session.status,
    //     notes: session.notes,
    //     type: 'regular',
    //     teacherId: session.class.teacherId,
    //     createdAt: session.createdAt,
    //     updatedAt: session.createdAt
    //   }));
    // } catch (error) {
    //   throw new Error(`Lỗi khi lấy lịch dạy theo tuần: ${error.message}`);
    // }
  }

  async getMonthlySchedule(teacherId: string, year: number, month: number) {
    // try {
    //   const startDate = new Date(year, month - 1, 1);
    //   const endDate = new Date(startDate);
    //   endDate.setDate(endDate.getDate() + 30);

    //   const schedules = await this.prisma.classSession.findMany({
    //     where: {
    //       class: { teacherId },
    //       sessionDate: {
    //         gte: startDate,
    //         lte: endDate
    //       },
    //     },
    //     include: {
    //       class: {
    //         include: {
    //           subject: { select: { name: true } },
    //         },
    //       },
    //       room: { select: { name: true } },
    //     },
    //     orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
    //   });

    //   // return schedules.map((session) => ({
    //   //   id: session.id,
    //   //   date: session.sessionDate,
    //   //   startTime: session.startTime,
    //   //   endTime: session.endTime,
    //   //   subject: session.class.subject.name,
    //   //   className: session.class.name,
    //   //   room: session.room?.name || 'Chưa xác định',
    //   //   studentCount: session.class.maxStudents || 0,
    //   //   status: session.status,
    //   //   notes: session.notes,
    //   //   type: 'regular',
    //   //   teacherId: session.class.teacherId,
    //   //   createdAt: session.createdAt,
    //   //   updatedAt: session.createdAt,
    //   // }));
    //   return null
    // } catch (error) {
    //   throw new Error(`Lỗi khi lấy lịch dạy theo tháng: ${error.message}`);
    // }
  }

  async getScheduleDetail(teacherId: string, scheduleId: string) {
    // try {
    //   const session = await this.prisma.classSession.findFirst({
    //     where: {
    //       id: scheduleId,
    //       class: { teacherId }
    //     },
    //     include: {
    //       class: {
    //         include: {
    //           teacher: {
    //             select: {
    //               id: true,
    //               user: {
    //                 select: {
    //                   fullName: true,
    //                   email: true
    //                 }
    //               }
    //             }
    //           },
    //           subject: { select: { name: true } }
    //         }
    //       },
    //       room: { select: { name: true } }
    //     }
    //   });

    //   if (!session) {
    //     return null;
    //   }

    //   return {
    //     id: session.id,
    //     date: session.sessionDate,
    //     startTime: session.startTime,
    //     endTime: session.endTime,
    //     subject: session.class.subject.name,
    //     className: session.class.name,
    //     room: session.room?.name || 'Chưa xác định',
    //     studentCount: session.class.maxStudents || 0,
    //     status: session.status,
    //     notes: session.notes,
    //     type: 'regular',
    //     teacherId: session.class.teacherId,
    //     createdAt: session.createdAt,
    //     updatedAt: session.createdAt
    //   };
    // } catch (error) {
    //   throw new Error(`Lỗi khi lấy chi tiết buổi dạy: ${error.message}`);
    // }
  }

  async updateScheduleStatus(
    teacherId: string, 
    scheduleId: string, 
    updateStatusDto: UpdateScheduleStatusDto
  ) {
    // try {
    //   // Kiểm tra xem buổi dạy có thuộc về giáo viên này không
    //   const existingSession = await this.prisma.classSession.findFirst({
    //     where: {
    //       id: scheduleId,
    //       class: { teacherId }
    //     },
    //     include: {
    //       class: {
    //         include: {
    //           subject: { select: { name: true } }
    //         }
    //       },
    //       room: { select: { name: true } }
    //     }
    //   });

    //   if (!existingSession) {
    //     return null;
    //   }

    //   const updatedSession = await this.prisma.classSession.update({
    //     where: { id: scheduleId },
    //     data: {
    //       status: updateStatusDto.status,
    //       notes: updateStatusDto.notes || existingSession.notes
    //     },
    //     include: {
    //       class: {
    //         include: {
    //           subject: { select: { name: true } }
    //         }
    //       },
    //       room: { select: { name: true } }
    //     }
    //   });

    //   return {
    //     id: updatedSession.id,
    //     date: updatedSession.sessionDate,
    //     startTime: updatedSession.startTime,
    //     endTime: updatedSession.endTime,
    //     subject: updatedSession.class.subject.name,
    //     className: updatedSession.class.name,
    //     room: updatedSession.room?.name || 'Chưa xác định',
    //     studentCount: updatedSession.class.maxStudents || 0,
    //     status: updatedSession.status,
    //     notes: updatedSession.notes,
    //     type: 'regular',
    //     teacherId: updatedSession.class.teacherId,
    //     createdAt: updatedSession.createdAt,
    //     updatedAt: updatedSession.createdAt
    //   };
    // } catch (error) {
    //   throw new Error(`Lỗi khi cập nhật trạng thái buổi dạy: ${error.message}`);
    // }
  }

  async exportScheduleToExcel(teacherId: string, filters: ScheduleFiltersDto): Promise<Buffer> {
    try {
      // TODO: Implement Excel export sau khi cài đặt exceljs
      throw new Error('Excel export chưa được implement. Cần cài đặt exceljs package.');
    } catch (error) {
      throw new Error(`Lỗi khi xuất Excel: ${error.message}`);
    }
  }

  private getTypeText(type: string): string {
    switch (type) {
      case 'regular': return 'Thường';
      case 'exam': return 'Thi';
      case 'makeup': return 'Học bù';
      default: return type;
    }
  }

  private getStatusText(status: string): string {
    switch (status) {
      case 'scheduled': return 'Đã lên lịch';
      case 'completed': return 'Đã hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  }
}