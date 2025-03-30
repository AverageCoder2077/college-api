import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, IsEmail} from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ description: 'Student\'s first name' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Student\'s last name' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Student\'s email address' }) // Add this ApiProperty for email
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Student\'s password', format: 'password', minLength: 12 })
  @IsNotEmpty()
  @IsString()
  @MinLength(12)
  password: string;

  @ApiProperty({ description: 'Confirm student\'s password', format: 'password', minLength: 12 })
  @IsNotEmpty()
  @IsString()
  @MinLength(12)
  confirmPassword: string;
}

export class UpdateStudentDto {
  @ApiProperty({ description: 'Student\'s first name', required: false })
  @IsString()
  firstName?: string;

  @ApiProperty({ description: 'Student\'s last name', required: false })
  @IsString()
  lastName?: string;

  @ApiProperty({ description: 'Student\'s email address', required: false })
  @IsEmail()
  email?: string;
}

export class UpdateStudentPasswordDto {
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
