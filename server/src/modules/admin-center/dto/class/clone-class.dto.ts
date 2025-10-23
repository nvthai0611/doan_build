import { IsString, IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CloneClassDto {
  @ApiProperty({ description: 'Tên lớp học mới', example: 'Toán 6K22-Clone' })
  @IsString()
  @IsNotEmpty({ message: 'Tên lớp học là bắt buộc' })
  name: string;

  @ApiProperty({ description: 'Clone lịch học', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  cloneSchedule?: boolean;

  @ApiProperty({ description: 'Clone giáo viên', example: false, required: false })
  @IsBoolean()
  @IsOptional()
  cloneTeacher?: boolean;

  @ApiProperty({ description: 'Clone học sinh', example: false, required: false })
  @IsBoolean()
  @IsOptional()
  cloneStudents?: boolean;

//   @ApiProperty({ description: 'Clone chương trình học', example: true, required: false })
//   @IsBoolean()
//   @IsOptional()
//   cloneCurriculum?: boolean;

  @ApiProperty({ description: 'Clone phòng học', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  cloneRoom?: boolean;
}

