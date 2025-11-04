import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class UpdateGradeDto {
    @ApiProperty({ description: 'ID của assessment', format: 'uuid' })
    @IsUUID()
    assessmentId: string;

    @ApiProperty({ description: 'ID học sinh', format: 'uuid' })
    @IsUUID()
    studentId: string;

    @ApiProperty({ description: 'Điểm số (0-10)', required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    score?: number;

    @ApiProperty({ description: 'Nhận xét', required: false })
    @IsOptional()
    @IsString()
    feedback?: string;
}