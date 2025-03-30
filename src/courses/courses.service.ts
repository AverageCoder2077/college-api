import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { Teacher } from 'src/entities/teacher.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
  ) {}

  async getCourses(): Promise<Course[]> {
    return this.courseRepository.find({ relations: ['teacher'] });
  }

  async getCourseById(id: number): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['teacher'],
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  async createCourse(dto: CreateCourseDto): Promise<Course> {
    // Check for duplicates
    const existingCourse = await this.courseRepository.findOne({
      where: { name: dto.name, level: dto.level },
    });
    if (existingCourse) {
      throw new BadRequestException(
        `Course with name "${dto.name}" and level "${dto.level}" already exists`,
      );
    }

    const course = new Course();
    course.name = dto.name;
    course.level = dto.level;
    return this.courseRepository.save(course);
  }

  async editCourse(courseId: number, dto: UpdateCourseDto): Promise<Course> {
    const course = await this.getCourseById(courseId); // Use the getCourseById method
    Object.assign(course, dto);
    return this.courseRepository.save(course);
  }

  async deleteCourse(courseId: number): Promise<void> {
    const course = await this.getCourseById(courseId); // Use the getCourseById method
    await this.courseRepository.remove(course);
  }

  async setCourseTeacher(
    courseId: number,
    teacherId: number,
  ): Promise<Course> {
    const course = await this.getCourseById(courseId);
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId },
    });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }
    course.teacher = teacher;
    return this.courseRepository.save(course);
  }
}
