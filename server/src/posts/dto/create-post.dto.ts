import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  name: string;
  price: number;
}
