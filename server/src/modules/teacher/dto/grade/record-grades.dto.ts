import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

class GradeEntryDto {
    @ApiProperty({ description: 'ID học sinh', format: 'uuid' })
    @IsUUID()
    studentId: string;

    @ApiProperty({ description: 'Điểm số (0-10), có thể để trống nếu chưa chấm', minimum: 0, maximum: 10, required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    score?: number;

    @ApiProperty({ description: 'Nhận xét của giáo viên', required: false })
    @IsOptional()
    @IsString()
    feedback?: string;
}

export class RecordGradesDto {
    @ApiProperty({ description: 'ID lớp học', format: 'uuid' })
    @IsUUID()
    classId: string;

    @ApiProperty({ description: 'Tên bài kiểm tra (VD: Kiểm tra chương 1)' })
    @IsString()
    assessmentName: string;

    @ApiProperty({ description: 'Loại kiểm tra (quiz/midterm/final/homework/oral/...)' })
    @IsString()
    assessmentType: string;

    @ApiProperty({ description: 'Điểm tối đa của bài kiểm tra (optional, sẽ tự động lấy từ SystemSetting theo assessmentType)', example: 10, required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    maxScore?: number;

    @ApiProperty({ description: 'Ngày kiểm tra (ISO date: YYYY-MM-DD)' })
    @IsDateString()
    date: string;

    @ApiProperty({ description: 'Mô tả chi tiết (tùy chọn)', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ type: [GradeEntryDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GradeEntryDto)
    grades: GradeEntryDto[];
}

export { GradeEntryDto };