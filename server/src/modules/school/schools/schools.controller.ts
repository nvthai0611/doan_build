import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SchoolsService } from './schools.service';

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
}
