import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req, ParseIntPipe, UnauthorizedException } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto, UpdateTeacherDto, UpdateTeacherPasswordDto } from './dto/teacher.dto';
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

@Controller('teachers')
@ApiTags('Teachers')
@ApiBearerAuth()
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  @Roles(UserRole.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ 
    summary: 'Get all teachers',
    description: 'Retrieve a list of all teachers. Only accessible by administrators.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of teachers',
    schema: {
      example: [{
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        title: 'Professor',
        role: 'teacher'
      }]
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Requires Admin role'
  })
  async getTeachers() {
    return this.teachersService.getTeachers();
  }

  @Get(':id')
  @Roles(UserRole.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ 
    summary: 'Get teacher by ID',
    description: 'Retrieve detailed information about a specific teacher. Only accessible by administrators.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Teacher object',
    schema: {
      example: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        title: 'Professor',
        role: 'teacher'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Teacher not found',
    schema: {
      example: {
        message: 'Teacher not found',
        error: 'Not Found',
        statusCode: 404
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Requires Admin role'
  })
  async getTeacherById(@Param('id', ParseIntPipe) id: number) {
    return this.teachersService.getTeacherById(id);
  }

  @Post()
  @Roles(UserRole.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ 
    summary: 'Create a new teacher',
    description: 'Create a new teacher in the system. Only accessible by administrators.'
  })
  @ApiBody({
    type: CreateTeacherDto,
    examples: {
      example1: {
        value: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          title: 'Professor',
          password: 'password123456',
          confirmPassword: 'password123456'
        },
        description: 'Example teacher creation data'
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Teacher created',
    schema: {
      example: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        title: 'Professor',
        role: 'teacher'
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
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Requires Admin role'
  })
  async createTeacher(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teachersService.createTeacher(createTeacherDto);
  }

  @Put(':id')
  @Roles(UserRole.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Update teacher information' })
  @ApiResponse({ status: 200, description: 'Teacher information updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  async editTeacher(@Param('id', ParseIntPipe) id: number, @Body() updateTeacherDto: UpdateTeacherDto) {
    return this.teachersService.editTeacher(id, updateTeacherDto);
  }

  @Put(':id/password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update teacher password' })
  @ApiResponse({ status: 200, description: 'Password updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateTeacherPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeacherPasswordDto: UpdateTeacherPasswordDto,
    @Req() req: RequestWithUser, // Use the custom RequestWithUser interface
  ) {
    const teacherId = id;
    const user = req.user;  // Access the user property
    if (user?.role !== UserRole.Admin && user?.sub !== teacherId) {
      throw new UnauthorizedException('You can only change your own password');
    }
    await this.teachersService.updateTeacherPassword(teacherId, updateTeacherPasswordDto);
    return { message: 'Password updated successfully' };
  }

  @Delete(':id')
  @Roles(UserRole.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Delete a teacher' })
  @ApiResponse({ status: 200, description: 'Teacher deleted' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  async deleteTeacher(@Param('id', ParseIntPipe) id: number) {
    await this.teachersService.deleteTeacher(id);
    return { message: 'Teacher deleted successfully' };
  }

  @Get(':id/courses')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Teacher)
  @ApiOperation({ 
    summary: 'Get courses taught by a teacher',
    description: 'Retrieve a list of courses taught by a specific teacher. Teachers can only view their own courses, while administrators can view any teacher\'s courses.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of courses',
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
    description: 'Unauthorized - Teachers can only view their own courses'
  })
  async getCoursesForTeacher(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    const user = req.user;
    const teacherId = id;
    if (user?.role !== UserRole.Admin && user?.sub !== teacherId) {
      throw new UnauthorizedException('You can only view courses for yourself');
    }
    return this.teachersService.getCoursesForTeacher(teacherId);
  }

  @Get(':id/courses/:courseId/students')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Teacher)
  @ApiOperation({ 
    summary: 'Get students in a specific course',
    description: 'Retrieve a list of students enrolled in a specific course taught by a teacher. Teachers can only view students in their own courses, while administrators can view students in any course.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of students',
    schema: {
      example: [{
        id: 1,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com'
      }]
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Course not found or teacher not assigned to it'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Teachers can only view students in their own courses'
  })
  async getStudentsInCourse(
    @Param('id', ParseIntPipe) id: number,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Req() req: RequestWithUser,
  ) {
    const user = req.user;
    const teacherId = id;
    if (user?.role !== UserRole.Admin && user?.sub !== teacherId) {
      throw new UnauthorizedException('You can only view students in your own courses');
    }
    return this.teachersService.getStudentsInCourse(teacherId, courseId);
  }

  @Get(':id/students')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Teacher)
  @ApiOperation({ 
    summary: 'Get all students taught by a teacher',
    description: 'Retrieve a list of all students enrolled in any course taught by a teacher. Teachers can only view students in their own courses, while administrators can view students in any teacher\'s courses.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of students',
    schema: {
      example: [{
        id: 1,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com'
      }]
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Teachers can only view students in their own courses'
  })
  async getAllStudentsForTeacherCourses(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    const user = req.user;
    const teacherId = id;
    if (user?.role !== UserRole.Admin && user?.sub !== teacherId) {
      throw new UnauthorizedException('You can only view students from your own courses');
    }
    return this.teachersService.getAllStudentsForTeacherCourses(id);
  }
}

