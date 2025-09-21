import { PartialType } from '@nestjs/swagger';
import { CreateStudentParentLinkDto } from './create-student-parent-link.dto';

export class UpdateStudentParentLinkDto extends PartialType(CreateStudentParentLinkDto) {}
