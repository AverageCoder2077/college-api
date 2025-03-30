import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/auth/user-role.enum';
import { RolesGuard } from 'src/auth/roles.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@Controller('courses')
@ApiTags('Courses')
@ApiBearerAuth()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Teacher)
  @ApiOperation({ 
    summary: 'Get all courses',
    description: 'Retrieve a list of all courses. Accessible by administrators and teachers.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns an array of courses',
    schema: {
      example: [{
        id: 1,
        name: 'Mathematics 101',
        level: 'Beginner',
        credits: 3,
        teacher: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          title: 'Professor'
        }
      }]
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Requires Admin or Teacher role'
  })
  async getCourses() {
    return this.coursesService.getCourses();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Teacher)
  @ApiOperation({ 
    summary: 'Get a course by ID',
    description: 'Retrieve detailed information about a specific course. Accessible by administrators and teachers.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the course',
    schema: {
      example: {
        id: 1,
        name: 'Mathematics 101',
        level: 'Beginner',
        credits: 3,
        teacher: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          title: 'Professor'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Course not found',
    schema: {
      example: {
        message: 'Course not found',
        error: 'Not Found',
        statusCode: 404
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Requires Admin or Teacher role'
  })
  async getCourseById(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.getCourseById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @ApiOperation({ 
    summary: 'Create a new course',
    description: 'Create a new course in the system. Only accessible by administrators.'
  })
  @ApiBody({
    type: CreateCourseDto,
    examples: {
      example1: {
        value: {
          name: 'Mathematics 101',
          level: 'Beginner',
          credits: 3
        },
        description: 'Example course creation data'
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'The course has been successfully created.',
    schema: {
      example: {
        id: 1,
        name: 'Mathematics 101',
        level: 'Beginner',
        credits: 3
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid input data',
    schema: {
      example: {
        message: ['Level must be one of: Beginner, Intermediate, Advanced'],
        error: 'Bad Request',
        statusCode: 400
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Requires Admin role'
  })
  async createCourse(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.createCourse(createCourseDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @ApiOperation({ 
    summary: 'Update a course',
    description: 'Update an existing course\'s information. Only accessible by administrators.'
  })
  @ApiBody({
    type: UpdateCourseDto,
    examples: {
      example1: {
        value: {
          name: 'Mathematics 101 - Updated',
          level: 'Intermediate',
          credits: 4
        },
        description: 'Example course update data'
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'The course has been updated.',
    schema: {
      example: {
        id: 1,
        name: 'Mathematics 101 - Updated',
        level: 'Intermediate',
        credits: 4
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Course not found',
    schema: {
      example: {
        message: 'Course not found',
        error: 'Not Found',
        statusCode: 404
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Requires Admin role'
  })
  async editCourse(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.editCourse(id, updateCourseDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @ApiOperation({ 
    summary: 'Delete a course',
    description: 'Delete a course from the system. Only accessible by administrators.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'The course has been deleted.',
    schema: {
      example: {
        message: 'Course deleted successfully'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Course not found',
    schema: {
      example: {
        message: 'Course not found',
        error: 'Not Found',
        statusCode: 404
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Requires Admin role'
  })
  async deleteCourse(@Param('id', ParseIntPipe) id: number) {
    await this.coursesService.deleteCourse(id);
    return { message: 'Course deleted successfully' };
  }

  @Put(':courseId/teacher/:teacherId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @ApiOperation({ 
    summary: 'Set a teacher for a course',
    description: 'Assign a teacher to a course. Only accessible by administrators.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Teacher assigned to course',
    schema: {
      example: {
        message: 'Teacher assigned to course',
        course: {
          id: 1,
          name: 'Mathematics 101',
          level: 'Beginner',
          credits: 3,
          teacher: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            title: 'Professor'
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Course or teacher not found',
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
  async setCourseTeacher(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('teacherId', ParseIntPipe) teacherId: number,
  ) {
    const course = await this.coursesService.setCourseTeacher(courseId, teacherId);
    return { message: 'Teacher assigned to course', course };
  }
}