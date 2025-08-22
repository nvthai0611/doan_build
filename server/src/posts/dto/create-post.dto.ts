import { IsString, IsInt, MinLength, Min } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsInt()
  @Min(1)
  price: number;
}
