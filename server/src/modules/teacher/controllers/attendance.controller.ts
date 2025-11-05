import { Body, Controller, Get, Param, Post, Put, Req, HttpException, HttpStatus } from '@nestjs/common';
import { AttendanceService } from '../services/attendance.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AttendanceResponseDto } from '../dto/attendance/attendance-response.dto';
import { EmailNotificationService } from '../../shared/services/email-notification.service';

interface SendAbsentNotificationsDto {
  studentIds: string[];
}

interface AttendanceRecordDto {
  studentId: string;
  status: 'present' | 'absent' | 'excused' | 'late';
  note?: string;
}

@ApiTags('Teacher - Attendance')
@Controller('attendances')
export class AttendanceController {
    constructor(
        private readonly attendanceService: AttendanceService,
        private readonly emailNotificationService: EmailNotificationService
    ){}

    @Get(':sessionId/students')
    @ApiOperation({ summary: 'Lấy danh sách học sinh theo ID buổi học' })
    @ApiParam({
        name: 'sessionId',
        description: 'ID của buổi học',
    })
    @ApiResponse({
        status: 200,
        description: 'Lấy danh sách học sinh thành công'
    })
    @ApiResponse({
        status: 400,
        description: 'Session ID không hợp lệ'
    })
    @ApiResponse({
        status: 404,
        description: 'Buổi học không tồn tại'
    })
    async getListStudentBySessionId(@Param('sessionId') sessionId: string) {
        return this.attendanceService.getListStudentBySessionId(sessionId);
    }

    @Get(':sessionId/leave-requests')
    @ApiOperation({ summary: 'Lấy danh sách đơn xin nghỉ trong ngày học' })
    @ApiParam({
        name: 'sessionId',
        description: 'ID của buổi học',
    })
    @ApiResponse({
        status: 200,
        description: 'Lấy danh sách đơn xin nghỉ thành công'
    })
    @ApiResponse({
        status: 400,
        description: 'Session ID không hợp lệ'
    })
    @ApiResponse({
        status: 404,
        description: 'Buổi học không tồn tại'
    })
    async getLeaveRequestsBySessionId(@Param('sessionId') sessionId: string) {
        return this.attendanceService.getLeaveRequestsBySessionId(sessionId);
    }

    @Get(':sessionId')
    @ApiOperation({ summary: 'Lấy danh sách điểm danh theo ID buổi học' })
    @ApiParam({
        name: 'sessionId',
        description: 'ID của buổi học',
    })
    @ApiResponse({
        status: 200,
        description: 'Lấy danh sách điểm danh thành công',
        type: AttendanceResponseDto
    })
    @ApiResponse({
        status: 400,
        description: 'Session ID không hợp lệ'
    })
    async getAttendanceBySessionId(@Param('sessionId') sessionId: string) {
        return this.attendanceService.getAttendanceBySessionId(sessionId);
    }

    @Put(':sessionId')
    @ApiOperation({ summary: 'Điểm danh học sinh theo buổi học (tự động duyệt đơn xin nghỉ nếu chọn excused)' })
    @ApiParam({
        name: 'sessionId',
        description: 'ID của buổi học',
    })
    @ApiResponse({
        status: 200,
        description: 'Điểm danh học sinh thành công',
        type: AttendanceResponseDto
    })
    @ApiResponse({
        status: 400,
        description: 'Session ID không hợp lệ hoặc không thể cập nhật điểm danh'
    })
    @ApiResponse({
        status: 404,
        description: 'Buổi học không tồn tại'
    })
    async attendanceStudentBySessionId(
        @Req() request: any,
        @Param('sessionId') sessionId: string,
        @Body() records: AttendanceRecordDto[]
    ) {
        try {
            if (!sessionId) {
                throw new HttpException(
                    'Session ID không được để trống',
                    HttpStatus.BAD_REQUEST
                );
            }

            if (!records || !Array.isArray(records) || records.length === 0) {
                throw new HttpException(
                    'Danh sách bản ghi điểm danh không được để trống',
                    HttpStatus.BAD_REQUEST
                );
            }

            const teacherId = request?.user?.teacherId;
            
            if (!teacherId) {
                throw new HttpException(
                    'Không tìm thấy thông tin giáo viên',
                    HttpStatus.UNAUTHORIZED
                );
            }

            // Validate records
            for (const record of records) {
                if (!record.studentId) {
                    throw new HttpException(
                        'Student ID không được để trống',
                        HttpStatus.BAD_REQUEST
                    );
                }
                if (!['present', 'absent', 'excused', 'late'].includes(record.status)) {
                    throw new HttpException(
                        `Trạng thái '${record.status}' không hợp lệ`,
                        HttpStatus.BAD_REQUEST
                    );
                }
            }

            const result = await this.attendanceService.attendanceStudentBySessionId(
                sessionId,
                records,
                teacherId
            );

            return {
                data: result.data,
                message: result.message
            };
        } catch (error) {
            console.error('Error in attendanceStudentBySessionId:', error);
            throw error;
        }
    }

    @Post(':sessionId/send-absent-notifications')
    @ApiOperation({ summary: 'Gửi email thông báo vắng mặt cho phụ huynh' })
    @ApiParam({
        name: 'sessionId',
        description: 'ID của buổi học',
    })
    @ApiResponse({
        status: 200,
        description: 'Gửi email thông báo vắng mặt thành công'
    })
    @ApiResponse({
        status: 400,
        description: 'Dữ liệu không hợp lệ'
    })
    @ApiResponse({
        status: 404,
        description: 'Không tìm thấy buổi học hoặc giáo viên'
    })
    async sendAbsentNotifications(
        @Req() request: any,
        @Param('sessionId') sessionId: string,
        @Body() body: SendAbsentNotificationsDto
    ) {
        try {
            const teacherId = request?.user?.teacherId;
            
            if (!teacherId) {
                throw new HttpException(
                    'Không tìm thấy thông tin giáo viên',
                    HttpStatus.UNAUTHORIZED
                );
            }

            if (!body.studentIds || body.studentIds.length === 0) {
                throw new HttpException(
                    'Danh sách học sinh không được để trống',
                    HttpStatus.BAD_REQUEST
                );
            }

            const result = await this.emailNotificationService.sendStudentAbsenceEmail(
                body.studentIds,
                sessionId,
                teacherId
            );

            let message = '';
            if (result.alreadySentCount > 0) {
                message = `Đã gửi ${result.sentCount} email mới. ${result.alreadySentCount} học sinh đã được gửi email trước đó`;
            } else {
                message = `Đã gửi ${result.sentCount}/${result.totalStudents} email thông báo vắng học thành công`;
            }

            if (result.failCount > 0) {
                message += `. ${result.failCount} email gửi thất bại`;
            }

            return {
                data: result,
                message
            };
        } catch (error) {
            console.error('Error sending absent notifications:', error);
            throw error;
        }
    }
}
