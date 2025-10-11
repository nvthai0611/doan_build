import { query } from 'express';
import { StudentManagementService } from '../services/student-management.service';
import { Controller, Get, Injectable, Query } from "@nestjs/common";
import { ApiTags } from '@nestjs/swagger';

@Injectable()
@ApiTags('Admin Center -Student Management')
@Controller('student-management')
export class StudentManagementController {
    constructor(private readonly studentManagementService: StudentManagementService){}

    @Get()
    async getAllStudents (@Query() query: any){
        
        return this.studentManagementService.getAllStudents(
            query.status,
             query.search,
             parseInt(query.page),
             parseInt(query.limit)
        );
    }

    @Get('count-status')
    async countByStatus(){
        return this.studentManagementService.getCountByStatus();
    }
}