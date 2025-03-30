import { Controller, Post, Body, ValidationPipe, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { StudentLoginDto, TeacherLoginDto } from './dto/auth.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('student/login')
  @ApiOperation({ 
    summary: 'Login as a student',
    description: 'Authenticate a student and receive a JWT token. Use this token in the Authorization header for subsequent requests.'
  })
  @ApiBody({
    type: StudentLoginDto,
    examples: {
      example1: {
        value: {
          email: 'student1@example.com',
          password: 'password123456'
        },
        description: 'Example student login credentials'
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns a JWT token',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials',
    schema: {
      example: {
        message: 'Invalid credentials',
        error: 'Unauthorized',
        statusCode: 401
      }
    }
  })
  async studentLogin(@Body(new ValidationPipe()) studentLoginDto: StudentLoginDto) {
    return this.authService.studentLogin(studentLoginDto);
  }

  @Post('teacher/login')
  @ApiOperation({ 
    summary: 'Login as a teacher or admin',
    description: 'Authenticate a teacher or admin and receive a JWT token. Use this token in the Authorization header for subsequent requests.'
  })
  @ApiBody({
    type: TeacherLoginDto,
    examples: {
      example1: {
        value: {
          email: 'admin@example.com',
          password: 'adminpassword123'
        },
        description: 'Example admin login credentials'
      },
      example2: {
        value: {
          email: 'teacher1@example.com',
          password: 'password123456'
        },
        description: 'Example teacher login credentials'
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns a JWT token',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials',
    schema: {
      example: {
        message: 'Invalid credentials',
        error: 'Unauthorized',
        statusCode: 401
      }
    }
  })
  async teacherLogin(@Body(new ValidationPipe()) teacherLoginDto: TeacherLoginDto) {
    return this.authService.teacherLogin(teacherLoginDto);
  }
}