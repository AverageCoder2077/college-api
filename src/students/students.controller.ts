import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req, ParseIntPipe, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto, UpdateStudentPasswordDto } from './dto/student.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/auth/user-role.enum';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

// Define a custom interface for the Request object with the 'user' property
interface RequestWithUser extends Request {
  user?: { sub: number; email: string; role: UserRole };
}

@Controller('students')
@ApiTags('Students')
@ApiBearerAuth()
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @Roles(UserRole.Admin, UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ 
    summary: 'Get all students',
    description: 'Retrieve a list of all students. Only accessible by administrators and teachers.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of students',
    schema: {
      example: [{
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      }]
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Requires Admin or Teacher role',
    schema: {
      example: {
        message: 'Unauthorized',
        error: 'Forbidden',
        statusCode: 403
      }
    }
  })
  async getStudents() {
    return this.studentsService.getStudents();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get student by ID',
    description: 'Retrieve detailed information about a specific student. Students can view their own profile, while administrators and teachers can view any student profile.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Student object',
    schema: {
      example: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Student not found',
    schema: {
      example: {
        message: 'Student not found',
        error: 'Not Found',
        statusCode: 404
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Requires Admin or Teacher role'
  })
  async getStudentById(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    const user = req.user;
    if (user?.role !== UserRole.Admin && user?.role !== UserRole.Teacher && user?.sub !== id) {
      throw new UnauthorizedException('You can only view your own profile');
    }
    return this.studentsService.getStudentById(id);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Register a new student',
    description: 'Register a new student in the system. This endpoint is public and does not require authentication.'
  })
  @ApiBody({
    type: CreateStudentDto,
    examples: {
      example1: {
        value: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123456',
          confirmPassword: 'password123456'
        },
        description: 'Example student registration data'
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Student created',
    schema: {
      example: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid input data',
    schema: {
      example: {
        message: ['Password must be at least 12 characters long'],
        error: 'Bad Request',
        statusCode: 400
      }
    }
  })
  async registerStudent(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.registerStudent(createStudentDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Update student information',
    description: 'Update a student\'s information. Only the student themselves or an administrator can update their information.'
  })
  @ApiBody({
    type: UpdateStudentDto,
    examples: {
      example1: {
        value: {
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@example.com'
        },
        description: 'Example student update data'
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Student information updated',
    schema: {
      example: {
        id: 1,
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Only the student themselves or an administrator can update their information'
  })
  async updateStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
    @Req() req: RequestWithUser,
  ) {
    const studentId = id;
    const user = req.user;
    if (user?.role !== UserRole.Admin && user?.sub !== studentId) {
      throw new UnauthorizedException();
    }
    return this.studentsService.updateStudent(studentId, updateStudentDto);
  }

  @Put(':id/password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update student password' })
  @ApiResponse({ status: 200, description: 'Password updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateStudentPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePasswordDto: UpdateStudentPasswordDto,
    @Req() req: RequestWithUser, // Use the custom RequestWithUser interface
  ) {
    const studentId = id;
    const user = req.user; // Now TypeScript knows 'user' might exist
    // Only the student themselves or an Admin can change the password
    if (user?.role !== UserRole.Admin && user?.sub !== studentId) {
      throw new UnauthorizedException();
    }
    await this.studentsService.updateStudentPassword(studentId, updatePasswordDto);
    return { message: 'Password updated successfully' };
  }

  @Delete(':id')
  @Roles(UserRole.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ 
    summary: 'Unregister a student',
    description: 'Remove a student from the system. Only accessible by administrators.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Student unregistered',
    schema: {
      example: {
        message: 'Student unregistered successfully'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Requires Admin role'
  })
  async unregisterStudent(@Param('id', ParseIntPipe) id: number) {
    await this.studentsService.unregisterStudent(id);
    return { message: 'Student unregistered successfully' };
  }

  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Enroll a student in a course' })
  @ApiResponse({ status: 201, description: 'Student enrolled in course' })
  @ApiResponse({ status: 403, description: 'Forbidden - You can only enroll yourself in courses' })
  @ApiBody({
    schema: {
      example: {
        courseId: 1
      }
    }
  })
  async enrollInCourse(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { courseId: number },
    @Req() req: RequestWithUser,
  ): Promise<{ message: string; enrollment: any }> {
    // Check if user is admin or the student themselves
    if (req.user?.role !== UserRole.Admin && req.user?.sub !== id) {
      throw new ForbiddenException('You can only enroll yourself in courses');
    }

    const enrollment = await this.studentsService.enrollInCourse(id, body.courseId);
    return {
      message: 'Student enrolled in course',
      enrollment: {
        id: enrollment.id,
        student: {
          id: enrollment.student.id,
          email: enrollment.student.email,
        },
        course: {
          id: enrollment.course.id,
          name: enrollment.course.name,
          level: enrollment.course.level,
        },
        enrollmentDate: enrollment.enrollmentDate,
      },
    };
  }

  @Delete(':studentId/unenroll/:courseId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Unenroll a student from a course' })
  @ApiResponse({ status: 200, description: 'Student unenrolled from course' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async unenrollFromCourse(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Req() req: RequestWithUser, // Use the custom RequestWithUser interface
  ) {
    const user = req.user;
    if (user?.role !== UserRole.Admin && user?.sub !== studentId) {
      throw new UnauthorizedException('Cannot unenroll other students');
    }
    await this.studentsService.unenrollFromCourse(studentId, courseId);
    return { message: 'Student unenrolled from course' };
  }

  @Get(':studentId/courses')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get courses a student is enrolled in',
    description: 'Retrieve a list of courses that a student is enrolled in. Only the student themselves or an administrator can view their courses.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of enrolled courses',
    schema: {
      example: [{
        id: 1,
        name: 'Mathematics 101',
        level: 'Beginner',
        credits: 3
      }]
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Only the student themselves or an administrator can view their courses'
  })
  async getEnrolledCourses(@Param('studentId', ParseIntPipe) studentId: number, @Req() req: RequestWithUser) {
    const user = req.user;
    if (user?.role !== UserRole.Admin && user?.sub !== studentId) {
      throw new UnauthorizedException('Cannot view other student\'s courses.');
    }
    return this.studentsService.getEnrolledCourses(studentId);
  }
}