"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailNotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
const bull_1 = require("@nestjs/bull");
let EmailNotificationService = class EmailNotificationService {
    constructor(prisma, emailNotificationQueue, teacherAccountQueue, classAssignTeacherQueue, enrollmentEmailQueue, classStatusChangeEmailQueue, classRequestEmailQueue, sessionChangeEmailQueue) {
        this.prisma = prisma;
        this.emailNotificationQueue = emailNotificationQueue;
        this.teacherAccountQueue = teacherAccountQueue;
        this.classAssignTeacherQueue = classAssignTeacherQueue;
        this.enrollmentEmailQueue = enrollmentEmailQueue;
        this.classStatusChangeEmailQueue = classStatusChangeEmailQueue;
        this.classRequestEmailQueue = classRequestEmailQueue;
        this.sessionChangeEmailQueue = sessionChangeEmailQueue;
    }
    getStatusLabel(status) {
        const statusLabels = {
            'draft': 'Bản nháp',
            'ready': 'Sẵn sàng',
            'active': 'Đang hoạt động',
            'completed': 'Đã hoàn thành',
            'cancelled': 'Đã hủy',
            'suspended': 'Tạm dừng'
        };
        return statusLabels[status] || status;
    }
    async sendStudentAbsenceEmail(studentIds, sessionId, teacherId) {
        try {
            if (!studentIds || studentIds.length === 0) {
                throw new common_1.HttpException('Danh sách học sinh không được để trống', common_1.HttpStatus.BAD_REQUEST);
            }
            console.log(`🚀 Bắt đầu xử lý gửi email cho ${studentIds.length} học sinh`);
            const attendanceRecords = await this.prisma.studentSessionAttendance.findMany({
                where: {
                    sessionId,
                    studentId: { in: studentIds },
                    status: 'absent'
                },
                select: {
                    studentId: true,
                    isSent: true,
                    sentAt: true
                }
            });
            const alreadySentStudentIds = attendanceRecords
                .filter(record => record.isSent === true)
                .map(record => record.studentId);
            const studentsToSendEmail = studentIds.filter(id => !alreadySentStudentIds.includes(id));
            if (studentsToSendEmail.length === 0) {
                console.log(`⚠️ Tất cả ${studentIds.length} học sinh đã được gửi email`);
                return {
                    success: true,
                    sentCount: 0,
                    failCount: 0,
                    alreadySentCount: alreadySentStudentIds.length,
                    totalStudents: studentIds.length,
                    message: 'Tất cả học sinh đã được gửi email thông báo vắng mặt trước đó',
                    details: []
                };
            }
            console.log(`📊 Thống kê:\n` +
                `   - Tổng: ${studentIds.length} học sinh\n` +
                `   - Cần gửi: ${studentsToSendEmail.length}\n` +
                `   - Đã gửi trước đó: ${alreadySentStudentIds.length}`);
            const session = await this.prisma.classSession.findUnique({
                where: { id: sessionId },
                include: {
                    class: {
                        include: {
                            subject: true
                        }
                    }
                }
            });
            if (!session) {
                throw new common_1.HttpException('Không tìm thấy buổi học', common_1.HttpStatus.NOT_FOUND);
            }
            const teacher = await this.prisma.teacher.findUnique({
                where: { id: teacherId },
                include: {
                    user: true
                }
            });
            if (!teacher) {
                throw new common_1.HttpException('Không tìm thấy giáo viên', common_1.HttpStatus.NOT_FOUND);
            }
            const students = await this.prisma.student.findMany({
                where: {
                    id: { in: studentsToSendEmail }
                },
                include: {
                    user: true,
                    parent: {
                        include: {
                            user: true
                        }
                    }
                }
            });
            if (students.length === 0) {
                throw new common_1.HttpException('Không tìm thấy học sinh nào cần gửi email', common_1.HttpStatus.NOT_FOUND);
            }
            const absenceDate = new Date(session.sessionDate).toLocaleDateString('vi-VN');
            const sessionTime = `${session.startTime} - ${session.endTime}`;
            const subjectName = session.class?.subject?.name || 'N/A';
            const className = session.class?.name || 'N/A';
            const teacherName = teacher.user?.fullName || 'N/A';
            const emailResults = [];
            const jobPromises = [];
            for (const student of students) {
                const parentEmail = student.parent?.user?.email;
                if (!parentEmail) {
                    console.warn(`⚠️ Không tìm thấy email phụ huynh cho học sinh ${student.user?.fullName}`);
                    emailResults.push({
                        studentId: student.id,
                        studentName: student.user?.fullName,
                        success: false,
                        reason: 'Không có email phụ huynh'
                    });
                    continue;
                }
                try {
                    const jobPromise = this.emailNotificationQueue.add('send_student_absence_email', {
                        to: parentEmail,
                        studentName: student.user?.fullName || 'N/A',
                        className,
                        absenceDate,
                        sessionTime,
                        subject: subjectName,
                        teacherName,
                        note: '',
                        sessionId,
                        studentId: student.id
                    }, {
                        priority: 1,
                        delay: 2000,
                        attempts: 3,
                        timeout: 60000,
                        backoff: {
                            type: 'exponential',
                            delay: 2000
                        },
                        removeOnComplete: 10,
                        removeOnFail: 5
                    });
                    jobPromises.push(jobPromise);
                    await this.prisma.studentSessionAttendance.updateMany({
                        where: {
                            sessionId,
                            studentId: student.id,
                            status: 'absent',
                            isSent: false
                        },
                        data: {
                            isSent: true,
                            sentAt: new Date()
                        }
                    });
                    console.log(`📨 Đã thêm job gửi email cho ${student.user?.fullName} vào queue`);
                    emailResults.push({
                        studentId: student.id,
                        studentName: student.user?.fullName,
                        parentEmail,
                        success: true
                    });
                }
                catch (error) {
                    console.error(`❌ Lỗi khi thêm job cho ${student.user?.fullName}: ${error.message}`);
                    emailResults.push({
                        studentId: student.id,
                        studentName: student.user?.fullName,
                        success: false,
                        reason: error.message
                    });
                }
            }
            await Promise.all(jobPromises);
            const successCount = emailResults.filter(r => r.success).length;
            const failCount = emailResults.filter(r => !r.success).length;
            console.log(`✅ Đã thêm ${successCount}/${studentsToSendEmail.length} email vào queue thành công\n` +
                `   - Thành công: ${successCount}\n` +
                `   - Thất bại: ${failCount}\n` +
                `   - Đã gửi trước: ${alreadySentStudentIds.length}`);
            return {
                success: true,
                sentCount: successCount,
                failCount,
                alreadySentCount: alreadySentStudentIds.length,
                totalStudents: studentIds.length,
                details: emailResults,
                message: `Đã thêm ${successCount} email vào hàng đợi. Email sẽ được gửi trong giây lát.`
            };
        }
        catch (error) {
            console.error('❌ Lỗi khi xử lý gửi email:', error);
            throw new common_1.HttpException(error.message || 'Lỗi khi gửi email thông báo vắng học', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getQueueStatus() {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
            this.emailNotificationQueue.getWaitingCount(),
            this.emailNotificationQueue.getActiveCount(),
            this.emailNotificationQueue.getCompletedCount(),
            this.emailNotificationQueue.getFailedCount(),
            this.emailNotificationQueue.getDelayedCount(),
        ]);
        return {
            waiting,
            active,
            completed,
            failed,
            delayed,
            total: waiting + active + completed + failed + delayed
        };
    }
    async sendTeacherAccountEmail(teacherId, teacherName, username, email, password, teacherCode) {
        try {
            console.log(`Thêm job gửi email tài khoản cho giáo viên: ${teacherName}`);
            await this.teacherAccountQueue.add('send_teacher_account_email', {
                to: email,
                teacherName,
                username,
                email,
                password,
                teacherCode,
                teacherId,
            });
            console.log(`Đã thêm job gửi email tài khoản vào queue cho: ${email}`);
            return {
                success: true,
                message: 'Email job đã được thêm vào queue',
                teacherId,
                email,
            };
        }
        catch (error) {
            console.error(`Lỗi khi thêm job email tài khoản: ${error.message}`);
            throw new common_1.HttpException(`Không thể gửi email tài khoản: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async sendClassAssignTeacherEmail(classId, teacherId) {
        try {
            const classData = await this.prisma.class.findUnique({
                where: { id: classId },
                include: {
                    subject: true,
                },
            });
            if (!classData) {
                throw new common_1.HttpException('Không tìm thấy lớp học', common_1.HttpStatus.NOT_FOUND);
            }
            const teacher = await this.prisma.teacher.findUnique({
                where: { id: teacherId },
                include: {
                    user: {
                        select: {
                            fullName: true,
                            email: true,
                        },
                    },
                },
            });
            if (!teacher) {
                throw new common_1.HttpException('Không tìm thấy giáo viên', common_1.HttpStatus.NOT_FOUND);
            }
            await this.classAssignTeacherQueue.add('send_class_assign_teacher_email', {
                to: teacher.user.email,
                teacherId: teacher.id,
                teacherName: teacher.user.fullName,
                classId: classData.id,
                className: classData.name,
                subject: classData.subject?.name,
                startDate: classData.actualStartDate ? new Date(classData.actualStartDate).toLocaleDateString('vi-VN') : undefined,
                schedule: classData.recurringSchedule,
            });
            console.log(`Đã thêm job gửi email phân công lớp vào queue cho: ${teacher.user.email}`);
            return {
                success: true,
                message: 'Email job đã được thêm vào queue',
                teacherId,
                classId,
                email: teacher.user.email,
            };
        }
        catch (error) {
            console.error(`Lỗi khi thêm job email phân công lớp: ${error.message}`);
            throw new common_1.HttpException(`Không thể gửi email phân công lớp: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async sendClassRemoveTeacherEmail(classId, teacherId, reason) {
        try {
            const classData = await this.prisma.class.findUnique({
                where: { id: classId },
                select: {
                    id: true,
                    name: true,
                },
            });
            if (!classData) {
                throw new common_1.HttpException('Không tìm thấy lớp học', common_1.HttpStatus.NOT_FOUND);
            }
            const teacher = await this.prisma.teacher.findUnique({
                where: { id: teacherId },
                include: {
                    user: {
                        select: {
                            fullName: true,
                            email: true,
                        },
                    },
                },
            });
            if (!teacher) {
                throw new common_1.HttpException('Không tìm thấy giáo viên', common_1.HttpStatus.NOT_FOUND);
            }
            console.log(`Thêm job gửi email hủy phân công lớp cho giáo viên: ${teacher.user.fullName}`);
            await this.classAssignTeacherQueue.add('send_class_remove_teacher_email', {
                to: teacher.user.email,
                teacherId: teacher.id,
                teacherName: teacher.user.fullName,
                classId: classData.id,
                className: classData.name,
                reason,
            });
            console.log(`✅ Đã thêm job gửi email hủy phân công lớp vào queue cho: ${teacher.user.email}`);
            return {
                success: true,
                message: 'Email job đã được thêm vào queue',
                teacherId,
                classId,
                email: teacher.user.email,
            };
        }
        catch (error) {
            console.error(`Lỗi khi thêm job email hủy phân công lớp: ${error.message}`);
            throw new common_1.HttpException(`Không thể gửi email hủy phân công lớp: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async sendBulkEnrollmentEmail(studentIds, classId, transferInfo) {
        try {
            const classData = await this.prisma.class.findUnique({
                where: { id: classId },
                include: {
                    subject: true,
                    teacher: {
                        include: {
                            user: true
                        }
                    },
                    _count: {
                        select: { sessions: true }
                    }
                }
            });
            if (!classData) {
                throw new common_1.HttpException('Không tìm thấy lớp học', common_1.HttpStatus.NOT_FOUND);
            }
            const hasSession = classData._count.sessions > 0;
            const enrollmentStatus = hasSession ? 'studying' : 'not_been_updated';
            const students = await this.prisma.student.findMany({
                where: {
                    id: { in: studentIds }
                },
                include: {
                    user: true,
                    parent: {
                        include: {
                            user: true
                        }
                    }
                }
            });
            if (students.length === 0) {
                throw new common_1.HttpException('Không tìm thấy học sinh nào', common_1.HttpStatus.NOT_FOUND);
            }
            let oldClassName;
            if (transferInfo) {
                const oldClass = await this.prisma.class.findUnique({
                    where: { id: transferInfo.oldClassId },
                    select: { name: true }
                });
                oldClassName = oldClass?.name || 'N/A';
            }
            const className = classData.name || 'N/A';
            const subjectName = classData.subject?.name || 'N/A';
            const teacherName = classData.teacher?.user?.fullName || undefined;
            const startDate = classData.actualStartDate
                ? new Date(classData.actualStartDate).toLocaleDateString('vi-VN')
                : undefined;
            const schedule = classData.recurringSchedule || undefined;
            const emailResults = [];
            const jobPromises = [];
            for (const student of students) {
                const parentEmail = student.parent?.user?.email;
                const parentName = student.parent?.user?.fullName || 'Quý phụ huynh';
                if (!parentEmail) {
                    console.warn(`Không tìm thấy email phụ huynh cho học sinh ${student.user?.fullName}`);
                    emailResults.push({
                        studentId: student.id,
                        studentName: student.user?.fullName,
                        success: false,
                        reason: 'Không có email phụ huynh'
                    });
                    continue;
                }
                try {
                    const jobPromise = this.enrollmentEmailQueue.add('send_enrollment_notification', {
                        to: parentEmail,
                        studentName: student.user?.fullName || 'N/A',
                        parentName,
                        className,
                        subjectName,
                        teacherName,
                        startDate,
                        schedule,
                        enrollmentStatus,
                        studentId: student.id,
                        classId,
                        isTransfer: !!transferInfo,
                        oldClassName: transferInfo ? oldClassName : undefined,
                        transferReason: transferInfo?.reason
                    }, {
                        priority: 2,
                        delay: 1000,
                        attempts: 3,
                        timeout: 60000,
                        backoff: {
                            type: 'exponential',
                            delay: 2000
                        },
                        removeOnComplete: 10,
                        removeOnFail: 5
                    });
                    jobPromises.push(jobPromise);
                    console.log(`Đã thêm job gửi email ${transferInfo ? 'chuyển lớp' : 'đăng ký'} cho ${student.user?.fullName} vào queue`);
                    emailResults.push({
                        studentId: student.id,
                        studentName: student.user?.fullName,
                        parentEmail,
                        success: true
                    });
                }
                catch (error) {
                    console.error(`Lỗi khi thêm job cho ${student.user?.fullName}: ${error.message}`);
                    emailResults.push({
                        studentId: student.id,
                        studentName: student.user?.fullName,
                        success: false,
                        reason: error.message
                    });
                }
            }
            await Promise.all(jobPromises);
            const successCount = emailResults.filter(r => r.success).length;
            const failCount = emailResults.filter(r => !r.success).length;
            console.log(`Đã thêm ${successCount}/${studentIds.length} email vào queue thành công\n` +
                `   - Thành công: ${successCount}\n` +
                `   - Thất bại: ${failCount}`);
            return {
                success: true,
                sentCount: successCount,
                failCount,
                totalStudents: studentIds.length,
                details: emailResults,
                message: `Đã thêm ${successCount} email thông báo ${transferInfo ? 'chuyển lớp' : 'đăng ký'} vào hàng đợi.`
            };
        }
        catch (error) {
            console.error('Lỗi khi xử lý gửi email đăng ký:', error);
            throw new common_1.HttpException(error.message || 'Lỗi khi gửi email thông báo đăng ký', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async sendClassStatusChangeEmailToParents(classId, oldStatus, newStatus) {
        try {
            const importantStatuses = ['active', 'completed', 'suspended', 'cancelled'];
            if (!importantStatuses.includes(newStatus)) {
                return { success: true, skipped: true, reason: 'Status không yêu cầu thông báo' };
            }
            console.log(`Bắt đầu gửi email thông báo thay đổi status lớp ${classId} từ "${oldStatus}" sang "${newStatus}"`);
            const classData = await this.prisma.class.findUnique({
                where: { id: classId },
                include: {
                    subject: true,
                    teacher: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                    email: true
                                }
                            }
                        }
                    },
                    enrollments: {
                        where: {
                            status: {
                                in: ['studying', 'not_been_updated', 'graduated']
                            }
                        },
                        include: {
                            student: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            fullName: true
                                        }
                                    },
                                    parent: {
                                        include: {
                                            user: {
                                                select: {
                                                    id: true,
                                                    fullName: true,
                                                    email: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            if (!classData) {
                throw new common_1.HttpException('Không tìm thấy lớp học', common_1.HttpStatus.NOT_FOUND);
            }
            if (classData.enrollments.length === 0) {
                console.log(`Lớp học không có học sinh đang học`);
                return { success: true, skipped: true, reason: 'Không có học sinh đang học' };
            }
            const statusLabels = {
                'active': {
                    label: 'Đang hoạt động',
                    color: '#4CAF50',
                    icon: '✅'
                },
                'completed': {
                    label: 'Đã hoàn thành',
                    color: '#2196F3',
                    icon: '🎓'
                },
                'suspended': {
                    label: 'Tạm dừng',
                    color: '#FF9800',
                    icon: '⏸️'
                },
                'cancelled': {
                    label: 'Đã hủy',
                    color: '#F44336',
                    icon: '❌'
                }
            };
            const statusInfo = statusLabels[newStatus] || {
                label: newStatus,
                color: '#757575',
                icon: '📌'
            };
            const className = classData.name || 'N/A';
            const subjectName = classData.subject?.name || 'N/A';
            const teacherName = classData.teacher?.user?.fullName;
            const parentEmailMap = new Map();
            for (const enrollment of classData.enrollments) {
                const parent = enrollment.student.parent;
                if (!parent || !parent.user?.email) {
                    console.warn(`Học sinh ${enrollment.student.user.fullName} không có email phụ huynh`);
                    continue;
                }
                const parentEmail = parent.user.email;
                const parentName = parent.user.fullName || 'Quý phụ huynh';
                const studentName = enrollment.student.user.fullName || 'N/A';
                if (!parentEmailMap.has(parentEmail)) {
                    parentEmailMap.set(parentEmail, {
                        parentName,
                        students: [studentName]
                    });
                }
                else {
                    parentEmailMap.get(parentEmail).students.push(studentName);
                }
            }
            const emailResults = [];
            const jobPromises = [];
            for (const [email, data] of parentEmailMap.entries()) {
                try {
                    const studentList = data.students.join(', ');
                    const jobPromise = this.classStatusChangeEmailQueue.add('send_class_status_change_notification', {
                        to: email,
                        parentName: data.parentName,
                        studentName: studentList,
                        className,
                        subjectName,
                        teacherName,
                        oldStatus,
                        newStatus,
                        statusLabel: statusInfo.label,
                        statusColor: statusInfo.color,
                        statusIcon: statusInfo.icon,
                        classId
                    }, {
                        priority: 2,
                        delay: 500,
                        attempts: 3,
                        timeout: 60000,
                        backoff: {
                            type: 'exponential',
                            delay: 2000
                        },
                        removeOnComplete: 10,
                        removeOnFail: 5
                    });
                    jobPromises.push(jobPromise);
                    emailResults.push({
                        email,
                        parentName: data.parentName,
                        students: data.students,
                        success: true
                    });
                    console.log(`Đã thêm job gửi email thông báo status cho ${data.parentName} (${email}) vào queue`);
                }
                catch (error) {
                    console.error(`❌ Lỗi khi thêm job cho ${email}:`, error.message);
                    emailResults.push({
                        email,
                        parentName: data.parentName,
                        students: data.students,
                        success: false,
                        error: error.message
                    });
                }
            }
            await Promise.all(jobPromises);
            const successCount = emailResults.filter(r => r.success).length;
            const failCount = emailResults.filter(r => !r.success).length;
            console.log(`Đã thêm ${successCount}/${parentEmailMap.size} job gửi email thông báo status vào queue\n` +
                `   - Thành công: ${successCount}\n` +
                `   - Thất bại: ${failCount}`);
            return {
                success: true,
                sentCount: successCount,
                failCount,
                totalParents: parentEmailMap.size,
                details: emailResults
            };
        }
        catch (error) {
            console.error(' Lỗi khi gửi email thông báo status:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async sendClassRequestApprovalEmail(requestId, studentId, classId, parentEmail, parentName, studentName, className, subjectName, teacherName, startDate, schedule, username, password) {
        try {
            console.log(`📧 Thêm job gửi email chấp nhận yêu cầu cho: ${parentEmail}`);
            await this.classRequestEmailQueue.add('send_approval_notification', {
                to: parentEmail,
                studentName,
                parentName,
                className,
                subjectName,
                teacherName,
                startDate,
                schedule,
                username,
                password,
                requestId,
                studentId,
                classId
            }, {
                priority: 2,
                attempts: 3,
                timeout: 60000,
                backoff: {
                    type: 'exponential',
                    delay: 2000
                },
                removeOnComplete: 10,
                removeOnFail: 5
            });
            console.log(`✅ Đã thêm job gửi email chấp nhận vào queue cho: ${parentEmail}`);
            return {
                success: true,
                message: 'Email job đã được thêm vào queue',
                parentEmail,
                requestId,
            };
        }
        catch (error) {
            console.error(`❌ Lỗi khi thêm job email chấp nhận: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async sendClassRequestRejectionEmail(requestId, studentId, classId, parentEmail, parentName, studentName, className, subjectName, reason) {
        try {
            console.log(`📧 Thêm job gửi email từ chối yêu cầu cho: ${parentEmail}`);
            await this.classRequestEmailQueue.add('send_rejection_notification', {
                to: parentEmail,
                studentName,
                parentName,
                className,
                subjectName,
                reason,
                requestId,
                studentId,
                classId,
            }, {
                priority: 2,
                attempts: 3,
                timeout: 60000,
                backoff: {
                    type: 'exponential',
                    delay: 2000
                },
                removeOnComplete: 10,
                removeOnFail: 5
            });
            console.log(`✅ Đã thêm job gửi email từ chối vào queue cho: ${parentEmail}`);
            return {
                success: true,
                message: 'Email job đã được thêm vào queue',
                parentEmail,
                requestId,
            };
        }
        catch (error) {
            console.error(`❌ Lỗi khi thêm job email từ chối: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async sendClassStartingNotificationEmail(to, data) {
        try {
            console.log(`📧 Thêm job gửi email thông báo lớp sắp bắt đầu cho: ${to}`);
            await this.emailNotificationQueue.add('send_class_starting_notification', {
                to,
                ...data,
            }, {
                priority: 2,
                attempts: 3,
                timeout: 60000,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                },
                removeOnComplete: 10,
                removeOnFail: 5,
            });
            console.log(`✅ Đã thêm job email thông báo lớp sắp bắt đầu vào queue cho: ${to}`);
            return {
                success: true,
                message: 'Email job đã được thêm vào queue',
                to,
            };
        }
        catch (error) {
            console.error(`❌ Lỗi khi thêm job email thông báo lớp sắp bắt đầu: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async sendClassEndingNotificationEmail(to, data) {
        try {
            console.log(`📧 Thêm job gửi email thông báo lớp sắp kết thúc cho: ${to}`);
            await this.emailNotificationQueue.add('send_class_ending_notification', {
                to,
                ...data,
            }, {
                priority: 2,
                attempts: 3,
                timeout: 60000,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                },
                removeOnComplete: 10,
                removeOnFail: 5,
            });
            console.log(`✅ Đã thêm job email thông báo lớp sắp kết thúc vào queue cho: ${to}`);
            return {
                success: true,
                message: 'Email job đã được thêm vào queue',
                to,
            };
        }
        catch (error) {
            console.error(`❌ Lỗi khi thêm job email thông báo lớp sắp kết thúc: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async sendSessionChangeEmail(sessionId, type, originalDate, originalTime, newDate, newTime, reason) {
        try {
            const session = await this.prisma.classSession.findUnique({
                where: { id: sessionId },
                include: {
                    class: {
                        include: {
                            subject: { select: { name: true } },
                            teacher: {
                                include: {
                                    user: { select: { fullName: true } }
                                }
                            },
                            enrollments: {
                                where: {
                                    status: { in: ['studying', 'not_been_updated'] }
                                },
                                include: {
                                    student: {
                                        include: {
                                            user: { select: { fullName: true, email: true } },
                                            parent: {
                                                include: {
                                                    user: { select: { fullName: true, email: true } }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            if (!session || !session.class) {
                throw new common_1.HttpException('Không tìm thấy buổi học', common_1.HttpStatus.NOT_FOUND);
            }
            const className = session.class.name;
            const subjectName = session.class.subject?.name || '';
            const teacherName = session.class.teacher?.user?.fullName || '';
            console.log(`[SessionChangeEmail] Lấy thông tin cho session ${sessionId}`);
            console.log(`  - Lớp: ${className}`);
            console.log(`  - Số enrollments: ${session.class.enrollments?.length || 0}`);
            const parentEmailMap = new Map();
            for (const enrollment of session.class.enrollments || []) {
                const student = enrollment.student;
                if (!student) {
                    console.log(`  - Enrollment: Không có student`);
                    continue;
                }
                const parent = student.parent;
                if (!parent) {
                    console.log(`  - Student: Không có parent`);
                    continue;
                }
                const parentUser = parent.user;
                if (!parentUser) {
                    console.log(`  - Parent: Không có user`);
                    continue;
                }
                if (!parentUser.email) {
                    console.log(`  - Parent user: Không có email`);
                    continue;
                }
                const studentName = student.user?.fullName || '';
                if (parentEmailMap.has(parentUser.email)) {
                    const existing = parentEmailMap.get(parentUser.email);
                    existing.studentNames.push(studentName);
                }
                else {
                    parentEmailMap.set(parentUser.email, {
                        parentName: parentUser.fullName,
                        studentNames: [studentName]
                    });
                }
            }
            console.log(`  - Tổng số phụ huynh có email: ${parentEmailMap.size}`);
            if (parentEmailMap.size === 0) {
                console.warn(`Không tìm thấy phụ huynh nào có email cho session ${sessionId}`);
                return {
                    success: true,
                    message: 'Không có phụ huynh nào để gửi email',
                    sentCount: 0,
                };
            }
            const emailJobs = Array.from(parentEmailMap.entries()).map(([email, data]) => {
                return this.sessionChangeEmailQueue.add('send_session_change_notification', {
                    to: email,
                    type,
                    parentName: data.parentName,
                    studentNames: data.studentNames,
                    className,
                    subjectName,
                    teacherName,
                    originalDate,
                    originalTime,
                    newDate: newDate || '',
                    newTime: newTime || '',
                    reason: reason || '',
                    sessionId,
                    classId: session.classId
                }, {
                    priority: 1,
                    attempts: 3,
                    timeout: 60000,
                    backoff: {
                        type: 'exponential',
                        delay: 2000,
                    },
                    removeOnComplete: 10,
                    removeOnFail: 5,
                });
            });
            await Promise.all(emailJobs);
            console.log(`Đã thêm ${emailJobs.length} job email thông báo thay đổi lịch vào queue cho session ${sessionId}`);
            return {
                success: true,
                message: 'Email jobs đã được thêm vào queue',
                sentCount: emailJobs.length,
            };
        }
        catch (error) {
            console.error(`Lỗi khi gửi email thông báo thay đổi lịch: ${error.message}`);
            throw new common_1.HttpException(`Lỗi khi gửi email: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.EmailNotificationService = EmailNotificationService;
exports.EmailNotificationService = EmailNotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bull_1.InjectQueue)('email_notification')),
    __param(2, (0, bull_1.InjectQueue)('teacher_account')),
    __param(3, (0, bull_1.InjectQueue)('class_assign_teacher')),
    __param(4, (0, bull_1.InjectQueue)('enrollment_email')),
    __param(5, (0, bull_1.InjectQueue)('class_status_change_email')),
    __param(6, (0, bull_1.InjectQueue)('class_request_email')),
    __param(7, (0, bull_1.InjectQueue)('session_change_email')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object, Object, Object, Object, Object, Object, Object])
], EmailNotificationService);
//# sourceMappingURL=email-notification.service.js.map