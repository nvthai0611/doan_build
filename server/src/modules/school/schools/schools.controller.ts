import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SchoolsService, CreateSchoolDto } from './schools.service';

@ApiTags('Schools')
@Controller('schools')
export class SchoolsController {
    constructor(
        private readonly schoolsService: SchoolsService
    ){}
    
    @Get()
    async findAll(){
        return this.schoolsService.findAll();
    }

    @Post()
    async create(@Body() createSchoolDto: CreateSchoolDto){
        return this.schoolsService.create(createSchoolDto);
    }
}
