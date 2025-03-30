import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, Matches} from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({ description: 'The name of the course' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The level of the course (e.g., 100, 200, 300)' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{3}$/, { message: 'Course level must be a 3-digit number (e.g., 100, 200, 300)' })
  level: string;
}

export class UpdateCourseDto {
  @ApiProperty({ description: 'The name of the course', required: false })
  @IsString()
  name?: string;

  @ApiProperty({ description: 'The level of the course (e.g., 100, 200, 300)', required: false })
  @IsString()
  @Matches(/^\d{3}$/, { message: 'Course level must be a 3-digit number (e.g., 100, 200, 300)' })
  level?: string;
}
