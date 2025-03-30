import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from '../entities/teacher.entity';
import { CreateTeacherDto, UpdateTeacherDto, UpdateTeacherPasswordDto } from './dto/teacher.dto';
import * as bcrypt from 'bcrypt';
import { Course } from '../entities/course.entity';
import { Student } from '../entities/student.entity'; // Import Student entity

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Student) // Inject Student Repository
    private studentRepository: Repository<Student>,
  ) {}

  async getTeachers(): Promise<Teacher[]> {
    return this.teacherRepository.find();
  }

  async getTeacherById(id: number): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOneBy({ id });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }
    return teacher;
  }

  async createTeacher(dto: CreateTeacherDto): Promise<Teacher> {
    const { password, confirmPassword, email, ...teacherData } = dto; // Extract email
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match'); // Consider a more specific exception
    }
    const existingTeacher = await this.teacherRepository.findOneBy({ email });
    if (existingTeacher) {
      throw new Error('Teacher with this email already exists'); // Consider a more specific exception
    }
    const teacher = this.teacherRepository.create({...teacherData, email}); // Include email in create
    teacher.passwordHash = await bcrypt.hash(password, 10);
    return this.teacherRepository.save(teacher);
  }

  async editTeacher(id: number, dto: UpdateTeacherDto): Promise<Teacher> {
    const teacher = await this.getTeacherById(id);
    Object.assign(teacher, dto);
    return this.teacherRepository.save(teacher);
  }

  async updateTeacherPassword(id: number, dto: UpdateTeacherPasswordDto): Promise<Teacher> {
    const teacher = await this.getTeacherById(id);
    // In a real application, you would verify the current password before updating
    teacher.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    return this.teacherRepository.save(teacher);
  }

  async deleteTeacher(id: number): Promise<void> {
    const teacher = await this.getTeacherById(id);
    await this.teacherRepository.remove(teacher);
  }

  async getCoursesForTeacher(teacherId: number): Promise<Course[]> {
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId },
      relations: ['courses']
    });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }
    return teacher.courses;
  }

  async getStudentsInCourse(teacherId: number, courseId: number): Promise<Student[]> {
    const teacher = await this.getTeacherById(teacherId);
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['students'], // Eagerly load students
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    return course.students;
  }

  async getAllStudentsForTeacherCourses(teacherId: number): Promise<Student[]> {
      const teacher = await this.getTeacherById(teacherId);
      const courses = await this.getCoursesForTeacher(teacherId);

      const students: Student[] = [];
      for (const course of courses) {
        const courseWithStudents = await this.courseRepository.findOne({
          where: { id: course.id },
          relations: ['students']
        });
        if(courseWithStudents && courseWithStudents.students) {
          students.push(...courseWithStudents.students);
        }
      }
      return students;
  }
}

