import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, IsEmail} from 'class-validator';

export class CreateTeacherDto {
  @ApiProperty({ description: 'Teacher\'s first name' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Teacher\'s last name' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Teacher\'s email address' }) // Added email property
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Teacher\'s title (e.g., \'Prof.\')' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Teacher\'s password', format: 'password', minLength: 12 })
  @IsNotEmpty()
  @IsString()
  @MinLength(12)
  password: string;

  @ApiProperty({ description: 'Confirm teacher\'s password', format: 'password', minLength: 12 })
  @IsNotEmpty()
  @IsString()
  @MinLength(12)
  confirmPassword: string;
}

export class UpdateTeacherDto {
  @ApiProperty({ description: 'Teacher\'s first name', required: false })
  @IsString()
  firstName?: string;

  @ApiProperty({ description: 'Teacher\'s last name', required: false })
  @IsString()
  lastName?: string;

  @ApiProperty({ description: 'Teacher\'s title', required: false })
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Teacher\'s email address', required: false }) // Keep email property
  @IsEmail()
  email?: string;
}

export class UpdateTeacherPasswordDto {
  @ApiProperty({ description: 'Current password', format: 'password', minLength: 12 })
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @ApiProperty({ description: 'New password', format: 'password', minLength: 12 })
  @IsNotEmpty()
  @IsString()
  @MinLength(12)
  newPassword: string;
}
