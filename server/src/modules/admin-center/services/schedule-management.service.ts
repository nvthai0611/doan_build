import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryScheduleDto, QueryScheduleMonthDto, QueryScheduleWeekDto } from '../dto/schedule/query-schedule.dto';
import { PrismaService } from 'src/db/prisma.service';

@Injectable()
export class ScheduleManagementService {
    constructor(private prisma: PrismaService) {}

    private mapSessionToClientShape(session: any) {
        return {
            id: session.id,
            name: session.class?.name || '',
            date: session.sessionDate.toISOString().slice(0, 10),
            startTime: session.startTime,
            endTime: session.endTime,
            roomName: session.room?.name || null,
            teacherName: session.class?.teacher?.user?.fullName || '',
            subjectName: session.class?.subject?.name || '',
            studentCount:
                (session.class?._count && session.class._count.enrollments) || 0,
            maxStudents: session.class?.maxStudents ?? 0,
            status: session.status,
        };
    }

    async getScheduleByDay(queryDto: QueryScheduleDto) {
        const { date } = queryDto;
        if (!date) return [];
        const sessions = await this.prisma.classSession.findMany({
            where: { 
                sessionDate: new Date(date),
                status: {
                    notIn: ['end', 'cancelled']
                },
                class: {
                    status: {
                        in: ['active', 'ready', 'suspended']
                    }
                }
            },
            orderBy: { startTime: 'asc' },
            include: {
                room: { select: { name: true } },
                class: {
                    select: {
                        name: true,
                        maxStudents: true,
                        subject: { select: { name: true } },
                        teacher: { 
                            select: { 
                                user: { 
                                    select: { 
                                        fullName: true 
                                    } 
                                } 
                            } 
                        },
                        _count: { select: { enrollments: true } },
                    },
                },
            },
        });
        return sessions.map((s) => this.mapSessionToClientShape(s));
    }

    async getScheduleByWeek(queryDto: QueryScheduleWeekDto) {
        const { startDate, endDate } = queryDto;
        const start = new Date(startDate);
        const end = new Date(endDate);
        // bao gồm cả endDate: dùng lte
        const sessions = await this.prisma.classSession.findMany({
            where: { 
                sessionDate: { gte: start, lte: end },
                status: {
                    notIn: ['end', 'cancelled']
                },
                class: {
                    status: {
                        in: ['active', 'ready', 'suspended']
                    }
                }
            },
            orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
            include: {
                room: { select: { name: true } },
                class: {
                    select: {
                        name: true,
                        maxStudents: true,
                        subject: { select: { name: true } },
                        teacher: { 
                            select: { 
                                user: { 
                                    select: { 
                                        fullName: true 
                                    } 
                                } 
                            } 
                        },
                        _count: { select: { enrollments: true } },
                    },
                },
            },
        });
        return sessions.map((s) => this.mapSessionToClientShape(s));
    }

    async getScheduleByMonth(queryDto: QueryScheduleMonthDto) {
        const { month, year } = queryDto;
        const monthNum = Number(month);
        const yearNum = Number(year);
        const firstDay = new Date(Date.UTC(yearNum, monthNum - 1, 1));
        const firstDayNextMonth = new Date(Date.UTC(yearNum, monthNum, 1));
        // dùng lt next month để bao toàn bộ tháng
        const sessions = await this.prisma.classSession.findMany({
            where: { 
                sessionDate: { gte: firstDay, lt: firstDayNextMonth },
                status: {
                    notIn: ['end', 'cancelled']
                },
                class: {
                    status: {
                        in: ['active', 'ready', 'suspended']
                    }
                }
            },
            orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
            include: {
                room: { select: { name: true } },
                class: {
                    select: {
                        name: true,
                        maxStudents: true,
                        subject: { select: { name: true } },
                        teacher: { 
                            select: { 
                                user: { 
                                    select: { 
                                        fullName: true 
                                    } 
                                } 
                            } 
                        },
                        _count: { select: { enrollments: true } },
                    },
                },
            },
        });
        return sessions.map((s) => this.mapSessionToClientShape(s));
    }

    /**
     * Lấy tất cả lịch của các lớp đang hoạt động/đang tuyển sinh/tạm dừng
     * Trả về các lớp kèm recurringSchedule của chúng để hiển thị pattern lịch học
     * 
     * @param expectedStartDate - Ngày bắt đầu dự kiến của lớp mới. Nếu có, chỉ trả về lớp có overlap với khoảng thời gian [expectedStartDate, 31/05 năm sau]
     */
    async getAllActiveClassesWithSchedules(expectedStartDate?: string) {
        const classes = await this.prisma.class.findMany({
            where: { 
                status: {
                    in: ['active', 'ready', 'suspended']
                },
                // Chỉ lấy lớp có recurringSchedule
                recurringSchedule: {
                    not: null
                }
            },
            select: {
                id: true,
                name: true,
                recurringSchedule: true,
                room: { 
                    select: { 
                        id: true,
                        name: true 
                    } 
                },
                teacher: { 
                    select: { 
                        user: { 
                            select: { 
                                fullName: true 
                            } 
                        } 
                    } 
                },
                subject: { 
                    select: { 
                        name: true 
                    } 
                },
                expectedStartDate: true,
                actualStartDate: true,
                actualEndDate: true,
            },
            orderBy: { name: 'asc' },
        });

        // Transform để trả về format phù hợp với frontend
        let result = classes.map((cls) => {
            const schedule = cls.recurringSchedule as any;
            return {
                classId: cls.id,
                className: cls.name,
                teacherName: cls.teacher?.user?.fullName || '',
                subjectName: cls.subject?.name || '',
                roomId: cls.room?.id || null,
                roomName: cls.room?.name || null,
                expectedStartDate: cls.expectedStartDate,
                actualStartDate: cls.actualStartDate,
                actualEndDate: cls.actualEndDate,
                schedules: schedule?.schedules || [], // Mảng các { day, startTime, endTime, roomId }
            };
        });

        // Filter các lớp có overlap với khoảng thời gian
        // Nếu có expectedStartDate: dùng expectedStartDate
        // Nếu không có: dùng ngày hiện tại
        const rangeStart = expectedStartDate 
            ? new Date(expectedStartDate)
            : new Date(); // Dùng ngày hiện tại nếu không có expectedStartDate
        
        rangeStart.setHours(0, 0, 0, 0);
        
        // Tính ngày kết thúc: 31/05 năm sau
        const nextYear = rangeStart.getFullYear() + 1;
        const rangeEnd = new Date(nextYear, 4, 31); // Tháng 5 (index 4)
        rangeEnd.setHours(23, 59, 59, 999);

        result = result.filter((cls) => {
                // Lấy ngày bắt đầu của lớp (ưu tiên actualStartDate, nếu không có thì dùng expectedStartDate)
                const classStart = cls.actualStartDate 
                    ? new Date(cls.actualStartDate)
                    : cls.expectedStartDate 
                    ? new Date(cls.expectedStartDate)
                    : null;
                
                if (!classStart) return false;

                // Lấy ngày kết thúc của lớp
                let classEnd: Date | null = null;
                if (cls.actualEndDate) {
                    classEnd = new Date(cls.actualEndDate);
                    classEnd.setHours(23, 59, 59, 999);
                } else {
                    // Mặc định là 31/05 năm sau của classStart
                    const classNextYear = classStart.getFullYear() + 1;
                    classEnd = new Date(classNextYear, 4, 31); // Tháng 5 (index 4)
                    classEnd.setHours(23, 59, 59, 999);
                }

                // Normalize dates để so sánh chỉ theo ngày
                const normalizedClassStart = new Date(classStart.getFullYear(), classStart.getMonth(), classStart.getDate());
                const normalizedClassEnd = new Date(classEnd.getFullYear(), classEnd.getMonth(), classEnd.getDate());
                const normalizedRangeStart = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate());
                const normalizedRangeEnd = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate());

                // Lớp có overlap nếu:
                // 1. Lớp chưa kết thúc trước khi khoảng thời gian bắt đầu: classEnd >= rangeStart
                // 2. Lớp chưa bắt đầu sau khi khoảng thời gian kết thúc: classStart <= rangeEnd
                
                // Nếu lớp đã kết thúc trước khi khoảng thời gian bắt đầu → loại bỏ
                if (normalizedClassEnd < normalizedRangeStart) {
                    return false;
                }
                
                // Nếu lớp sẽ bắt đầu sau khi khoảng thời gian kết thúc → loại bỏ
                if (normalizedClassStart > normalizedRangeEnd) {
                    return false;
                }
                
                // Các trường hợp còn lại đều có overlap
                return true;
            });

        return result;
    }

    /**
     * Lấy chi tiết buổi học theo ID
     */
    async getSessionById(sessionId: string) {
        const session = await this.prisma.classSession.findUnique({
            where: { id: sessionId },
            include: {
                class: {
                    select: {
                        id: true,
                        name: true,
                        classCode: true,
                        subject: {
                            select: {
                                id: true,
                                name: true,
                            }
                        },
                        grade: {
                            select: {
                                id: true,
                                name: true,
                            }
                        },
                        teacher: {
                            select: {
                                id: true,
                                user: {
                                    select: {
                                        id: true,
                                        fullName: true,
                                        email: true,
                                        phone: true,
                                        avatar: true,
                                    }
                                }
                            }
                        },
                        _count: {
                            select: {
                                enrollments: true,
                            }
                        }
                    }
                },
                room: {
                    select: {
                        id: true,
                        name: true,
                        capacity: true,
                    }
                },
                teacher: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                phone: true,
                                avatar: true,
                            }
                        }
                    }
                },
                attendances: {
                    select: {
                        id: true,
                        status: true,
                        note: true,
                        recordedAt: true,
                        student: {
                            select: {
                                id: true,
                                user: {
                                    select: {
                                        id: true,
                                        fullName: true,
                                        email: true,
                                        avatar: true,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!session) {
            throw new NotFoundException('Không tìm thấy buổi học');
        }

        return {
            id: session.id,
            name: session.notes || `Buổi ${session.academicYear}`,
            topic: session.notes,
            sessionDate: session.sessionDate,
            startTime: session.startTime,
            endTime: session.endTime,
            status: session.status,
            notes: session.notes,
            academicYear: session.academicYear,
            cancellationReason: session.cancellationReason,
            createdAt: session.createdAt,
            class: session.class,
            room: session.room,
            teacher: session.teacher,
            attendanceCount: session.attendances.length,
        };
    }

    /**
     * Lấy danh sách điểm danh của buổi học
     */
    async getSessionAttendance(sessionId: string) {
        // Kiểm tra buổi học có tồn tại không
        const session = await this.prisma.classSession.findUnique({
            where: { id: sessionId },
            select: { id: true, classId: true }
        });

        if (!session) {
            throw new NotFoundException('Không tìm thấy buổi học');
        }

        // Lấy danh sách attendance từ StudentSessionAttendance
        const attendances = await this.prisma.studentSessionAttendance.findMany({
            where: {
                sessionId: sessionId,
            },
            include: {
                student: {
                    select: {
                        id: true,
                        studentCode: true,
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                phone: true,
                                avatar: true,
                            }
                        }
                    }
                },
                recordedByTeacher: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                student: {
                    user: {
                        fullName: 'asc'
                    }
                }
            }
        });

        // Map to frontend format
        return attendances.map(attendance => ({
            id: attendance.id.toString(),
            sessionId: attendance.sessionId,
            studentId: attendance.studentId,
            studentName: attendance.student.user.fullName,
            studentCode: attendance.student.studentCode,
            status: attendance.status, // present, absent, late, not_attended
            checkInTime: attendance.recordedAt,
            checkOutTime: null, // Có thể bổ sung sau nếu cần
            note: attendance.note,
            recordedBy: attendance.recordedByTeacher?.user?.fullName,
            recordedAt: attendance.recordedAt,
            isSent: attendance.isSent,
            sentAt: attendance.sentAt,
            student: {
                id: attendance.student.id,
                studentCode: attendance.student.studentCode,
                user: attendance.student.user,
            },
            // Bổ sung các trường đánh giá (nếu có trong database)
            thaiDoHoc: null, // Có thể thêm vào StudentSessionAttendance model sau
            kyNangLamViecNhom: null, // Có thể thêm vào StudentSessionAttendance model sau
        }));
    }
}
