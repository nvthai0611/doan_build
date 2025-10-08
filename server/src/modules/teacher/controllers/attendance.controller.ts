import { Body, Controller, Get, Param, Post, Put, Req } from '@nestjs/common';
import { AttendanceService } from '../services/attendance.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AttendanceResponseDto } from '../dto/attendance/attendance-response.dto';

@ApiTags('Attendance')
@Controller('attendances')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService){}

    @Get(':sessionId')
    @ApiOperation({summary:'Lấy danh sách điểm danh theo ID buổi học'})
    @ApiParam({
        name:'sessionId',
        description:'ID của buổi học',
    })
    @ApiResponse({
        status:200,
        description:'Lấy danh sách điểm danh thành công',
        type: AttendanceResponseDto
    })
    @ApiResponse({
    status: 400,
    description: 'Session ID không hợp lệ'
  })
    async getAttendanceBySessionId(@Param('sessionId')sessionId: string) {
        return this.attendanceService.getAttendanceBySessionId(sessionId);
    }


    @Put(':sessionId')
    @ApiOperation({summary:'Điểm danh học sinh theo buổi học'})
    @ApiResponse({
        status:200,
        description:'Điểm danh học sinh thành công',
        type: AttendanceResponseDto
    })
    @ApiResponse({
        status: 400,
        description: 'Session ID không hợp lệ hoặc không thể cập nhật điểm danh cho buổi học đã hoàn thành hoặc đã qua ngày học'
      })
    @ApiResponse({
        status: 404,
        description: 'Buổi học không tồn tại'
    })
    async attendanceStudentBySessionId(
        @Req() request: any,
        @Param('sessionId') sessionId: string,
     @Body() records: any[]) {
        const teacherId = request?.teacherId
        return this.attendanceService.attendanceStudentBySessionId(sessionId, records, teacherId);
    }
}
