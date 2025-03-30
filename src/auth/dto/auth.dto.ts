import { IsString, IsNotEmpty, MinLength} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StudentLoginDto {
  @ApiProperty({ description: 'Student\'s email address' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ description: 'Student\'s password', format: 'password', minLength: 12 })
  @IsNotEmpty()
  @IsString()
  @MinLength(12)
  password: string;
}

export class TeacherLoginDto {
  @ApiProperty({ description: 'Teacher\'s email address' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ description: 'Teacher\'s password', format: 'password', minLength: 12 })
  @IsNotEmpty()
  @IsString()
  @MinLength(12)
  password: string;
}