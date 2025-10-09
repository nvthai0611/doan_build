import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { checkId } from 'src/utils/validate.util';

@Injectable()
export class AttendanceService {
    constructor(private prisma: PrismaService){}

    async getAttendanceBySessionId(sessionId: string) {
        if(!checkId(sessionId)){
            throw new HttpException(
                'Invalid session ID',
                HttpStatus.BAD_REQUEST
            )
        }

        const result = await this.prisma.studentSessionAttendance.findMany({
            where:{sessionId},
            include:{
                student:{
                    include:{
                        user:{
                            select:{
                                avatar:true,
                                fullName:true,
                            }
                        }
                    }
                },
                session:{
                    include:{
                        class:{
                            select:{
                                name:true,
                            }
                        }
                    }
                },
            },
            orderBy:{
                id:'asc'
            }
        })

        return result;
    }

    //Điểm danh học sinh theo buổi học
    // Chỉ update status cho các học sinh đã có
    async attendanceStudentBySessionId(sessionId: string, records: any[], teacherId: any) {
        if (!checkId(sessionId)) {
            throw new HttpException(
                'Invalid session ID',
                HttpStatus.BAD_REQUEST
            );
        }

        const findSession = await this.prisma.classSession.findUnique({
            where: { id: sessionId },
        });
        if(!findSession){
            throw new HttpException(
                'Buổi học không tồn tại',
                HttpStatus.NOT_FOUND
            );
        }

        if(findSession.status === 'completed'){
            throw new HttpException(
                'Không thể cập nhật điểm danh cho buổi học đã hoàn thành',
                HttpStatus.BAD_REQUEST
            );
        }

        if(findSession.sessionDate < new Date()){
            throw new HttpException(
                'Không thể cập nhật điểm danh cho buổi học nếu đã qua ngày học',
                HttpStatus.BAD_REQUEST
            );
        }

        // Đây là cho trường hợp lớp chưa đến lịch
    const sessionDate = new Date(findSession.sessionDate);
    const currentDate = new Date();
    
    // Compare dates only (ignore time)
    const sessionDateOnly = new Date(sessionDate.toDateString());
    const currentDateOnly = new Date(currentDate.toDateString());
    
    if (sessionDateOnly.getTime() !== currentDateOnly.getTime()) {
        throw new HttpException(
            'Chỉ có thể điểm danh vào đúng ngày học',
            HttpStatus.BAD_REQUEST
        );
    }
        try {
            const result = await this.prisma.$transaction(async (prisma) => {
                const updatePromises = records.map(record => 
                    prisma.studentSessionAttendance.update({
                        where: {
                            sessionId_studentId: {
                                sessionId,
                                studentId: record.studentId
                            }
                        },
                        data: {
                            status: record.status,
                            note: record.note || '',
                            recordedBy: teacherId,
                            recordedAt: new Date()
                        }
                    })
                );

                return Promise.all(updatePromises);
            });


            return {
                data: { 
                    updated: result.length,
                    total: records.length 
                },
                message: `Updated ${result.length} attendance records successfully`
            };
        } catch (error) {
            console.error('Error updating attendance:', error);
            throw new HttpException(
                'Failed to update attendance',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
