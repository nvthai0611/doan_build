import { query } from 'express';
import { StudentManagementService } from '../services/student-management.service';
import { Controller, Get, Injectable, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Injectable()
@ApiTags('Admin Center -Student Management')
@Controller('student-management')
export class StudentManagementController {
    constructor(private readonly studentManagementService: StudentManagementService){}

    @ApiOperation({summary: "Lấy danh sách học sinh"})
    @ApiResponse({
        status: 200,
        description:"Danh sách học sinh"
    })
    @ApiResponse({
        status: 400,
        description: "Không tìm thấy danh sách học sinh"
    })
    @Get()
    async getAllStudents (@Query() query: any){
        
        return this.studentManagementService.getAllStudents(
            query.status,
             query.search,
             query.birthMonth,
             query.birthYear,
             query.gender,
             query.accountStatus,
             query.customerConnection,
             query.course,
             parseInt(query.page),
             parseInt(query.limit)
        );
    }

    @Get('count-status')
    async countByStatus(){
        return this.studentManagementService.getCountByStatus();
    }
}