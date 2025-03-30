import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../entities/student.entity';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';
import { Course } from '../entities/course.entity';
import { Enrollment } from '../entities/enrollment.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
  ) {}

  async getStudents(): Promise<Student[]> {
    return this.studentRepository.find();
  }

  async getStudentById(id: number): Promise<Student> {
    const student = await this.studentRepository.findOneBy({ id });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async registerStudent(dto: CreateStudentDto): Promise<Student> {
    const { password, confirmPassword, email, ...studentData } = dto;
    
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const existingStudent = await this.studentRepository.findOneBy({ email });
    if (existingStudent) {
      throw new Error('Student with this email already exists');
    }
    
    const student = this.studentRepository.create({...studentData, email});
    await student.setPassword(password);
    return this.studentRepository.save(student);
  }

  async updateStudent(id: number, dto: UpdateStudentDto): Promise<Student> {
    const student = await this.getStudentById(id);
    Object.assign(student, dto);
    return this.studentRepository.save(student);
  }

  async updateStudentPassword(id: number, dto: { currentPassword: string; newPassword: string }): Promise<Student> {
    const student = await this.getStudentById(id);
    // In a real application, you would verify the current password before updating
    student.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    return this.studentRepository.save(student);
  }

  async unregisterStudent(id: number): Promise<void> {
    const student = await this.getStudentById(id);
    await this.studentRepository.remove(student);
  }

  async enrollInCourse(studentId: number, courseId: number): Promise<Enrollment> {
    const student = await this.getStudentById(studentId);
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['teacher']
    });
    
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // Check if student is already enrolled
    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: {
        student: { id: studentId },
        course: { id: courseId },
      },
    });

    if (existingEnrollment) {
      throw new Error('Student is already enrolled in this course');
    }

    const enrollment = this.enrollmentRepository.create({
      student,
      course,
      enrollmentDate: new Date(),
    });

    await this.enrollmentRepository.save(enrollment);
    
    // Reload the enrollment with all relations
    const savedEnrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollment.id },
      relations: ['student', 'course']
    });
    
    if (!savedEnrollment) {
      throw new NotFoundException(`Enrollment with ID ${enrollment.id} not found`);
    }
    
    return savedEnrollment;
  }

  async unenrollFromCourse(studentId: number, courseId: number): Promise<void> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: {
        student: { id: studentId },
        course: { id: courseId },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    await this.enrollmentRepository.remove(enrollment);
  }

  async getEnrolledCourses(studentId: number): Promise<Course[]> {
    const enrollments = await this.enrollmentRepository.find({
      where: { student: { id: studentId } },
      relations: ['course'],
    });

    return enrollments.map(enrollment => enrollment.course);
  }
}
